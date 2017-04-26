DELETE FROM dbo.ADRESY;
INSERT INTO dbo.ADRESY(adresaId, ulice, cislo, psc, mesto, stat, poznamka)
  SELECT 
    adresa_id AS adresaId,
    ulice,
    cislo,
    psc,
    mesto,
    stat,
    poznamka
  FROM sde.sde.FM_ADRESA;

DELETE FROM dbo.AREALY;
INSERT INTO dbo.AREALY(objectid, Shape, inetId, nazevPrez, nazevPrezEn, mesto, nazevPrezPridatUlici)
SELECT
    ROW_NUMBER() OVER (ORDER BY ai.AREAL_ID),
    a.Shape AS Shape,
    ai.AREAL_ID AS inetId,
    ai.NAZEV_PREZ AS nazevPrez,
    ISNULL(ai.NAZEV_PREZ_EN,ai.NAZEV_PREZ) AS nazevPrezEn,
    ai.MESTO AS mesto,
    ai.NAZEV_PREZ_PRIDAT_ULICI AS nazevPrezPridatUlici
  FROM sde.sde.fm_areal ai
    LEFT JOIN sde_publ.sde.AREALY a ON ai.AREAL_ID = a.inetId;

DELETE FROM dbo.PODLAZI;
INSERT INTO dbo.PODLAZI(objectid, polohKod, vrstvaId)
  SELECT 
    ROW_NUMBER() OVER (ORDER BY polohKod) AS objectid,
    polohKod AS polohKod,
    CASE
      WHEN vp.vrstvaId IS NOT NULL
        THEN vp.vrstvaId
        ELSE (ROW_NUMBER() OVER (ORDER BY polohKod)) + 10000
    END AS vrstvaId
  FROM sde_publ.sde.PODLAZI pod
    LEFT JOIN dbo.VRSTVA_PODLAZI vp ON pod.polohKod = vp.polohKodPodlazi
  WHERE hasGeometry = 1 AND polohKod NOT LIKE '_____S%';

DELETE FROM dbo.BUDOVY;
INSERT INTO dbo.BUDOVY(objectid, Shape, polohKod, nazev, nazevEn, vychoziPodlazi, maVnitrniGeometrii, arealId, oznaceni, oznaceniEn, budovaTyp, budovaTypEn, inetId)
  SELECT
    ROW_NUMBER() OVER (ORDER BY polohKod) AS objectid,
    Shape,
    b.polohKod,
    nazev,
    ISNULL(nazev_en, nazev),
    CASE
      WHEN (
        SELECT COUNT (p.polohKod)
        FROM dbo.PODLAZI p
        WHERE p.polohKod LIKE b.polohKod + 'N01'
        ) > 0
      THEN (
        SELECT TOP 1 p.polohKod
        FROM dbo.PODLAZI p
        WHERE p.polohKod LIKE b.polohKod + 'N01'
        )
      /*WHEN (
        SELECT COUNT (p.polohKod)
        FROM dbo.PODLAZI p
        WHERE p.polohKod LIKE b.polohKod + 'N%') > 0
      THEN (
        SELECT TOP 1 p.polohKod
        FROM dbo.PODLAZI p
        WHERE p.polohKod LIKE b.polohKod + 'N%'
        ORDER BY p.polohKod
        )
      ELSE (
        SELECT TOP 1 p.polohKod
        FROM dbo.PODLAZI p 
        WHERE p.polohKod LIKE b.polohKod + '%'
        )*/
    END AS vychoziPodlazi,
    CASE
      WHEN (
        SELECT COUNT (p.polohKod)
        FROM dbo.PODLAZI p
        WHERE p.polohKod LIKE b.polohKod + '%'
        ) > 0
      THEN 1
      ELSE 0
    END AS maVnitrniGeometrii,
    bi.areal_id AS arealId,
    bi.oznaceni AS oznaceni,
    CASE 
      WHEN bi.oznaceni_en IS NULL THEN bi.oznaceni
      ELSE bi.oznaceni_en
    END AS oznaceniEn,
    CASE
      WHEN budova_typ = 'B' THEN 'blok'
      WHEN budova_typ = 'O' THEN 'objekt'
      WHEN budova_typ = 'P' THEN 'pavilon'
      WHEN budova_typ = 'V' THEN 'budova'
    END AS budovaTyp,
    CASE
      WHEN budova_typ = 'B' THEN 'Block'
      WHEN budova_typ = 'O' THEN 'Object'
      WHEN budova_typ = 'P' THEN 'Pavilion'
      WHEN budova_typ = 'V' THEN 'Building'
    END AS budovaTypEn,
    inetId
  FROM sde_publ.sde.BUDOVY b
    JOIN
      sde.sde.FM_BUDOVA bi
    ON b.inetId = bi.cislo_budovy;

DELETE FROM dbo.BUDOVA_ADRESA;
INSERT INTO dbo.BUDOVA_ADRESA(objectid, polohKodBudova, adresaId, poradi, adresaTyp)
  SELECT
    ROW_NUMBER() OVER (ORDER BY adresa_id, b.polohKod) AS objectid,
    b.polohKod AS polohKodBudova,
    adresa_id AS adresaId,
    poradi,
    adresa_typ AS adresTyp 
  FROM sde.sde.FM_BUDOVA_ADRESA_ORACLE ba
    LEFT JOIN
      sde_publ.sde.BUDOVY b
    ON ba.cislo_budovy = b.inetId;

UPDATE dbo.AREALY
SET pocetBudov = (
    SELECT COUNT(*)
    FROM dbo.BUDOVY
    WHERE arealId = dbo.AREALY.inetId
  );

DELETE FROM dbo.AREAL_VSTUP;
INSERT INTO dbo.AREAL_VSTUP(arealVstupId, arealId, polohKodBudova, adresaId, popis, vstupHlavni)
  SELECT
    ROW_NUMBER() OVER (ORDER BY adresa_id, b.polohKod) AS arealVstupId,
    areal_id AS arealId,
    b.polohKod AS polohKodBudova,
    adresa_id AS adresaId,
    popis,
    vstup_hlavni AS vstupHlavni
  FROM sde.sde.FM_AREAL_VSTUP av
    LEFT JOIN
      sde_publ.sde.BUDOVY b
    ON av.budova_id = b.inetId;

DELETE FROM dbo.MISTNOSTI;
INSERT INTO dbo.MISTNOSTI(objectid, Shape, polohKod, cislo, nazev, nazevEn, ucel_nazev, ucel_skupina_nazev, pro_rozvrh, pro_vyuku, ucel_gis, vychoziPodlazi)		
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(mg.POLOH_KOD, mi.POLOH_KOD), mg.objectid, mi.MISTNOST_ID),
    mg.Shape,
    COALESCE(mg.POLOH_KOD, mi.POLOH_KOD) AS polohKod,
    CASE
      WHEN  ((mi.PROROZVRH LIKE 'A' AND mi.PROVYUKU LIKE 'A') OR
          us.UCEL_SKUPINA_ID IN (1, 2, 3, 4, 5) OR mi.NAZEV_UCEL IN ('jídelna', 'buffet', 'výdej jídel'))
        THEN mi.cislo
        ELSE NULL
    END AS cislo,
    CASE
      WHEN (mi.PROROZVRH LIKE 'A' AND mi.PROVYUKU LIKE 'A')
        THEN mi.nazev
          /*CASE
            WHEN (mis.mistnost_oznaceni IS NOT NULL AND mis.mistnost_oznaceni!=mi.nazev)
              THEN 
                CASE
                  WHEN mi.nazev LIKE '%' + mis.mistnost_oznaceni + '%' 
                    THEN mi.nazev
                    ELSE
                      CASE
                        WHEN mis.mistnost_oznaceni LIKE '%' + mi.nazev + '%'
                          THEN mis.mistnost_oznaceni
                          ELSE mis.mistnost_oznaceni + ' / ' + mi.nazev
                      END
                END
              ELSE mi.nazev
          END*/
        ELSE NULL
    END AS nazev,
    CASE
      WHEN (mi.PROROZVRH LIKE 'A' AND mi.PROVYUKU LIKE 'A')
        THEN ISNULL(mi.nazev_en, mi.nazev)
          /*CASE
            WHEN (mis.mistnost_oznaceni IS NOT NULL AND mis.mistnost_oznaceni!=ISNULL(mi.nazev_en,''))
              THEN 
                CASE
                  WHEN ISNULL(mi.nazev_en,'') LIKE '%' + mis.mistnost_oznaceni + '%' 
                    THEN mi.nazev_en
                    ELSE
                      CASE
                        WHEN mis.mistnost_oznaceni LIKE '%' +ISNULL(mi.nazev_en,'') + '%'
                          THEN mis.mistnost_oznaceni
                          ELSE mis.mistnost_oznaceni + ' / ' + mi.nazev_en
                      END
                END
              ELSE ISNULL(mi.nazev_en, mi.nazev)
          END*/
        ELSE NULL
    END AS nazevEn,
    mi.nazev_ucel AS ucel_nazev,
    us.NAZEV AS ucel_skupina_nazev,
    mi.PROROZVRH AS pro_rozvrh,
    mi.PROVYUKU AS pro_vyuku,
    CASE
      WHEN ((mi.nazev_ucel LIKE 'vrátnice') OR (mi.nazev_ucel LIKE 'příjem' AND mi.nazev LIKE 'recepce'))
        THEN 'informace'
      WHEN (mi.PROROZVRH LIKE 'A' AND mi.PROVYUKU LIKE 'A')
        THEN 'učebna'
    END AS ucel_gis,
    CASE 
      WHEN SUBSTRING(COALESCE(mg.POLOH_KOD, mi.POLOH_KOD), 0, 9) IN (
          SELECT vychoziPodlazi
          FROM dbo.BUDOVY
          WHERE maVnitrniGeometrii = 1
        )
      THEN 1
      ELSE 0
    END
  FROM sde_publ.sde.MISTNOST_PUDORYS_3857 mg
    FULL JOIN sde.sde.FM_MISTNOST_UCEL mi ON (mi.POLOH_KOD=mg.POLOH_KOD)
    FULL JOIN OPENQUERY([AMBER-FOR-BAPS], 'SELECT MISTNOST_OZNACENI,PASPORT_MISTNOST_ID FROM EXTERNSYS.PASPORT_VAZBA_MISTNOSTI') mis
      ON (mis.PASPORT_MISTNOST_ID=mi.MISTNOST_ID)
    LEFT JOIN sde.sde.FM_UCEL_SKUPINA_ORACLE us ON (mi.UCEL_SKUPINA_ID = us.UCEL_SKUPINA_ID)
  WHERE
    (COALESCE(mg.POLOH_KOD, mi.POLOH_KOD) LIKE '[A-Z][A-Z][A-Z][0-9][0-9][PNZM][0-9][0-9][0-9][0-9][0-9]' OR
     COALESCE(mg.POLOH_KOD, mi.POLOH_KOD) LIKE '[A-Z][A-Z][A-Z][0-9][0-9][PNZM][0-9][0-9][0-9][0-9][0-9][a-z]') AND
    (mi.NAZEV_UCEL IS NULL OR mi.NAZEV_UCEL NOT IN ('SX', 'PX', 'NX')) AND
    (COALESCE(mg.POLOH_KOD, mi.POLOH_KOD) NOT LIKE '___00%' AND COALESCE(mg.POLOH_KOD, mi.POLOH_KOD) NOT LIKE '_____[PNZM]__000%');


UPDATE dbo.MISTNOSTI
SET ucel_gis = 'výtah'
WHERE polohKod IN (
    SELECT DISTINCT tk.polohova_cast
    FROM sde_publ.sde.TechnologickyKod tk, sde_publ.sde.ProstredkyPodsystemu pp  
    WHERE pp.id = tk.prostredkypodsystemu_id AND tk.zarizeni_id IN (
        SELECT zarizeni_id
        FROM sde_publ.sde.ZarizeniCastGeometrie
        WHERE cast_geometrie_id IN (
            SELECT predek
            FROM sde_publ.sde.ZarizeniCastGeometrie
            WHERE zarizeni_id IN (
                SELECT tk.zarizeni_id
                FROM sde_publ.sde.TECHNOLOGICKYKOD tk
                  JOIN sde_publ.sde.PROSTREDKYPODSYSTEMU pp ON (tk.prostredkypodsystemu_id = pp.id)
                  JOIN sde_publ.sde.ATRIBUTYPROSTREDKU ap ON (pp.prostredek_id = ap.prostredek_id)
                  JOIN sde_publ.sde.HODNOTA h ON (ap.atribut_id = h.atribut_id AND tk.zarizeni_id = h.zarizeni_id)
                WHERE prostredkypodsystemu_id IN (
                    SELECT id
                    FROM sde_publ.sde.PROSTREDKYPODSYSTEMU
                    WHERE prostredek_id IN (
                        SELECT id
                        FROM sde_publ.sde.PROSTREDEK
                        WHERE nazev LIKE 'Zdvihací zařízení'
                      )
                  )
                  AND ap.atribut_id IN (
                      SELECT a.id
                      FROM sde_publ.sde.ATRIBUTYPROSTREDKU ap
                        JOIN sde_publ.sde.ATRIBUT a ON (ap.atribut_id = a.id)
                      WHERE prostredek_id IN (
                          SELECT id
                          FROM sde_publ.sde.PROSTREDEK
                          WHERE nazev LIKE 'Zdvihací zařízení'
                        )
                        AND nazev LIKE 'typ'	
                    )
                  AND hodnota_str LIKE 'výtah osobní'
              )
          )
      )
      AND tk.polohova_cast NOT IN (
          SELECT h.hodnota_str
          FROM sde_publ.sde.TECHNOLOGICKYKOD tk
            JOIN sde_publ.sde.PROSTREDKYPODSYSTEMU pp ON (tk.prostredkypodsystemu_id = pp.id)
            JOIN sde_publ.sde.ATRIBUTYPROSTREDKU ap ON (pp.prostredek_id = ap.prostredek_id)
            JOIN sde_publ.sde.HODNOTA h ON (ap.atribut_id = h.atribut_id AND tk.zarizeni_id = h.zarizeni_id)
          WHERE prostredkypodsystemu_id IN (
              SELECT id
              FROM sde_publ.sde.PROSTREDKYPODSYSTEMU
              WHERE prostredek_id IN (
                  SELECT id
                  FROM sde_publ.sde.PROSTREDEK
                  WHERE nazev LIKE 'Zdvihací zařízení'
                )
            )
            AND ap.atribut_id IN (
                SELECT a.id
                FROM sde_publ.sde.ATRIBUTYPROSTREDKU ap
                  JOIN sde_publ.sde.ATRIBUT a ON (ap.atribut_id = a.id)
                WHERE prostredek_id IN (
                    SELECT id
                    FROM sde_publ.sde.PROSTREDEK
                    WHERE nazev LIKE 'Zdvihací zařízení'
                  )
                  AND nazev LIKE 'strojovna'	
              )
        )
  )


DELETE FROM dbo.DVERE;
INSERT INTO dbo.DVERE(objectid, Shape, polohKod, polohKodPodlazi, pk)
SELECT
  ROW_NUMBER() OVER (ORDER BY polohKod) AS OBJECTID, 
  Shape,
  polohKod,
  polohKodPodlazi,
  pk
FROM sde_publ.sde.DVERE;


DELETE FROM dbo.BODY_ZAJMU;
INSERT INTO dbo.BODY_ZAJMU(objectid, Shape, typ, polohKodLokace, polohKodPodlazi, vychoziPodlazi)
  SELECT
    ROW_NUMBER() OVER (ORDER BY typ, polohKodLokace) AS OBJECTID,
    poi.*,
    CASE
      WHEN polohKodPodlazi IS NULL
        THEN NULL
        ELSE
          CASE
            WHEN polohKodPodlazi IN (
                SELECT vychoziPodlazi
                FROM dbo.BUDOVY
                WHERE maVnitrniGeometrii = 1
              )
            THEN 1
            ELSE 0
          END
    END AS vychoziPodlazi
  FROM 
    (SELECT
      mist.SHAPE.STCentroid() AS Shape,
      ucel_gis AS typ,
      polohKod AS polohKodLokace,
      SUBSTRING(polohKod, 0, 9) AS polohKodPodlazi
    FROM dbo.MISTNOSTI mist
    WHERE ucel_gis IS NOT NULL
    UNION ALL
    SELECT
      CASE 
        WHEN vstup.dverePK IS NOT NULL THEN dvere.SHAPE.STCentroid()
        WHEN vstup.mistnostPK IS NOT NULL THEN mist.SHAPE.STCentroid()
        WHEN vstup.SHAPE IS NOT NULL THEN vstup.SHAPE
      END AS Shape,
      CASE 
        WHEN vstup.arealId IS NOT NULL
          THEN
            CASE
              WHEN vstup.budovaPK IS NOT NULL
                THEN 'vstup do areálu a budovy'
                ELSE 'vstup do areálu'
            END
          ELSE 'vstup do budovy'
      END AS typ,
      CASE 
        WHEN vstup.dverePK IS NOT NULL THEN vstup.dverePK
        WHEN vstup.mistnostPK IS NOT NULL THEN vstup.mistnostPK
      END AS polohKodLokace,
      CASE 
        WHEN vstup.dverePK IS NOT NULL THEN SUBSTRING(vstup.dverePK, 0, 9) 
        WHEN vstup.mistnostPK IS NOT NULL THEN SUBSTRING(vstup.mistnostPK, 0, 9)
      END AS polohKodPodlazi
      FROM dbo.VSTUPY vstup
        LEFT JOIN
          dbo.MISTNOSTI mist ON vstup.mistnostPK = mist.polohKod
        LEFT JOIN
        dbo.DVERE dvere ON vstup.dverePK = dvere.polohKod
    UNION ALL
    SELECT 
      dvere.SHAPE.STCentroid() AS SHAPE,
      'vstup do budovy' AS typ,
      DVERE_POLOH_KOD AS polohKodLokace,
      SUBSTRING(DVERE_POLOH_KOD, 0, 9) AS polohKodPodlazi
    FROM sde.sde.BudovaVchod_evw bvc
      LEFT JOIN
        dbo.DVERE dvere ON DVERE_POLOH_KOD = dvere.polohKod
    WHERE bvc.VSTUP_HLAVNI LIKE 'A'
      AND
        DVERE_POLOH_KOD NOT IN (
          SELECT dverePK
          FROM dbo.VSTUPY
          WHERE dverePK IS NOT NULL
        )
    ) poi;

DELETE FROM dbo.PRACOVISTE;
INSERT INTO dbo.PRACOVISTE(objectid, nazevk_cs, nazevk_en, zkratka_cs, zkratka_en, budova_sidelni_id, areal_sidelni_id, priorita)
SELECT
  ROW_NUMBER() OVER (ORDER BY prac.nazevk_cs) AS OBJECTID, 
  prac.nazevk_cs,
  prac.nazevk_en,
  prac.zkratka_cs,
  prac.zkratka_en,
  prac.budova_sidelni_id,
  bud.arealId AS areal_sidelni_id,
  CASE
    WHEN prac.nazevk_cs LIKE '%fakulta%'
      THEN 1
    WHEN prac.nazevk_cs LIKE '%rektorát%'
      THEN 2
    ELSE 0
  END AS priorita
FROM sde.sde.PRACOVISTE prac, sde_munimap.dbo.budovy bud
WHERE prac.budova_sidelni_id = bud.inetId;

DELETE FROM dbo.ZASTAVKY;
INSERT INTO dbo.ZASTAVKY(OBJECTID, Shape, cislo, nazev, oznacnik)
SELECT
  OBJECTID, 
  Shape,
  cislo,
  nazev,
  oznacnik
FROM sde_publ.sde.ZASTAVKY2017_3857;

DELETE FROM dbo.OTEVIRANI_DVERI;
INSERT INTO dbo.OTEVIRANI_DVERI(OBJECTID, polohKodPodlazi, Shape)
SELECT
  ROW_NUMBER() OVER (ORDER BY OBJECTID) AS OBJECTID,
  polohKodPodlazi,
  Shape
FROM sde_publ.SDE.dvere_ote_pudorys
