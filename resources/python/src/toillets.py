# -*- coding: UTF-8 -*-

from functools import partial
import re

import arcpy

import config


dataset = '/sde_munimap.DBO.publ'
fc_prefix = '/sde_munimap.DBO.'
room_fc = config.gisdb_munimap + dataset + fc_prefix + 'mistnosti'
poi_fc = config.gisdb_munimap + dataset + fc_prefix + 'body_zajmu'


room_purpose_tab = config.gisdb + '/sde.sde.FM_MISTNOST_UCEL'
room_name_column = 'nazev_mistnosti'

memory = 'in_memory'


def get_floors(input_layer):
    """

    :param input_layer: layer to find distinct floors
    :return: list of floors
    """
    floors = []
    for row in arcpy.da.SearchCursor(input_layer, ['polohKod']):
        floor_code = row[0][5:8]
        if floor_code not in floors:
            floors.append(floor_code)
    return floors


def no_superset_in_list(set_list, subset):
    """

    :param set_list: list of sets
    :param subset:  subset
    :return: boolean True if list does not contain superset of given subset
    """
    result = True
    for set_x in set_list:
        if (type(set_x) is set) and set_x > subset:
            result = False
            break
    return result


def process_toilets_for_floor(floor, layer, name, insert_cursor):
    """

    :param floor: floor to be processed
    :param layer: layer of toilet group
    :param name: name for group of toilets
    :param insert_cursor: insert cursor for poi layer
    """
    where = "polohKod LIKE '_____" + floor + "%'"
    arcpy.SelectLayerByAttribute_management(layer, where_clause=where)
    buffered = arcpy.Buffer_analysis(layer, memory + '\\buffer', 0.8)
    overlap_sets = []
    fields = ('polohKod', 'SHAPE@', room_name_column)
    for row in arcpy.da.SearchCursor(buffered, fields):
        overlapping = set()
        overlapping.add(row[0])
        for row2 in arcpy.da.SearchCursor(buffered, fields):
            if row2[1].overlaps(row[1]):
                overlapping.add(row2[0])
        if overlapping not in overlap_sets:
            overlap_sets.append(overlapping)

    f = partial(no_superset_in_list, overlap_sets)
    without_subsets = filter(f, overlap_sets)
    for overlapping in without_subsets:
        codes = "'" + "', '".join(overlapping) + "'"
        where = "polohKod IN (" + codes + ")"
        arcpy.SelectLayerByAttribute_management(layer, where_clause=where)
        rooms = arcpy.da.SearchCursor(layer, fields, where)
        halls = [room for room in rooms
                 if re.search(u'předsíň', room[2]) is not None]
        rooms.reset()
        if len(halls) == 0:
            bb = arcpy.MinimumBoundingGeometry_management(
                    layer, memory + '\\bb', 'CONVEX_HULL', 'ALL')
            bb_cursor = arcpy.da.SearchCursor(bb, ('SHAPE@'))
            for x in bb_cursor:
                geom = x[0].centroid
            del bb_cursor
            arcpy.Delete_management(bb)
            room = rooms.next()
        else:
            room = halls[0]
            geom = room[1].centroid
        type_name = 'WC'
        if name != '':
            type_name += ' ' + name
        location_code = room[0]
        insert_cursor.insertRow([type_name, location_code,
                                location_code[:8], geom])
        del room
        del rooms
    arcpy.Delete_management(buffered)


def create_toilet_poi(wc_layer, output_fc, keywords=[],
                      name='', omit=False):
    """

    :param wc_layer: room layer to be processed
    :param output_fc: poi layer to insert toilet poi into
    :param keywords: list of keywords defining type of toilets
    :param name: name for group of toilets
    :param omit: if True features will be omitted
    """
    matched = []
    where = ''
    toilet_group_fc = None
    feature_oids = []
    if len(keywords) > 0:
        toilet_group_fc = arcpy.CreateFeatureclass_management(
                memory, 'toilet_group_fc', 'POLYGON', wc_layer)
        toilet_group = arcpy.MakeFeatureLayer_management(toilet_group_fc)

        for kw in keywords:
            insert_wc = arcpy.InsertCursor(toilet_group)
            regex = re.compile('(^|[^a-z])' + kw + '([^a-z]|$)', re.UNICODE)
            for row in arcpy.SearchCursor(wc_layer):
                room_name = row.getValue(room_name_column)
                if re.search('^[S]?[0-9]{3}', room_name) is not None:
                    feature_oids.append(row.getValue('OBJECTID'))
                elif regex.search(room_name) is not None:
                    feature_oids.append(row.getValue('OBJECTID'))
                    if not omit:
                        insert_wc.insertRow(row)
            del insert_wc
        for row in arcpy.SearchCursor(wc_layer):
            room_name = row.getValue(room_name_column)
            if re.search('^[S]?[0-9]{3}', room_name) is not None:
                feature_oids.append(row.getValue('OBJECTID'))
        if len(feature_oids) > 0:
            where = 'OBJECTID IN (' +\
                    ', '.join(str(x) for x in feature_oids) + ')'
    else:
        for row in arcpy.SearchCursor(wc_layer):
            room_name = row.getValue(room_name_column)
            if re.search('^[S]?[0-9]{3}', room_name) is not None:
                feature_oids.append(row.getValue('OBJECTID'))
        if len(feature_oids) > 0:
            where = 'OBJECTID IN (' + \
                    ', '.join(str(x) for x in feature_oids) + ')'
            toilet_group = arcpy.MakeFeatureLayer_management(wc_layer, where)
        else:
            toilet_group = arcpy.MakeFeatureLayer_management(wc_layer)

    field_names = ['typ', 'polohKodLokace', 'polohKodPodlazi', 'SHAPE@']
    insert_poi = arcpy.da.InsertCursor(output_fc, field_names)

    floors = get_floors(toilet_group)
    for floor in floors:
        process_toilets_for_floor(floor, toilet_group, name, insert_poi)

    del insert_poi

    features_to_delete = arcpy.SelectLayerByAttribute_management(
            wc_layer, where_clause=where)
    arcpy.DeleteFeatures_management(features_to_delete)
    arcpy.Delete_management(toilet_group)
    if toilet_group_fc is not None:
        arcpy.Delete_management(toilet_group_fc)


groups = dict()
groups['employ'] = [u'bufet', u'byt', u'děkana', u'dodavatele', u'dodavatelů',
                    u'HWCA', u'pedagog', u'personál', u'personálu',
                    u'stravování', u'učitelů', u'uklízečky', u'zam', u'zam.',
                    u'zaměst.', u'zaměstnanci', u'zaměstnanců']
groups['immobile'] = [u'bezbariérová', u'bezbariérové', u'imobil.',
                      u'imobilní', u'IMOBILNÍ', u'invalida', u'Invalida',
                      u'invalidé', u'invalidi', u'invalidové', u'invalidů',
                      u'telesně postižených', u'TP', u'vozíčkáři']
groups['men'] = [u'HSPM', u'm', u'muži', u'mužů', u'pánské', u'pisoár',
                 u'pisoáry']
groups['women'] = [u'dámské', u'dámy', u'HSPŽ', u'studentky', u'ž', u'žen',
                   u'ženy']

arcpy.env.workspace = '../../'

try:
    where = "ucel_nazev LIKE 'WC'"
    wc_fc_temp = arcpy.Select_analysis(room_fc, memory + '\\toilets', where)

    in_fields = [['POLOH_KOD', 'polohKod'], ['NAZEV', room_name_column]]
    where = "nazev_ucel LIKE 'WC'"
    room_name = arcpy.MakeQueryTable_management(room_purpose_tab,
                                                 memory + '\\room_name',
                                                 'USE_KEY_FIELDS',
                                                 'POLOH_KOD', in_fields, where)
    join_table = arcpy.CopyRows_management(room_name, memory + '\\join_table')
    arcpy.JoinField_management(wc_fc_temp, 'polohKod', join_table,
                               'polohKod', [room_name_column])

    wc_layer = arcpy.MakeFeatureLayer_management(wc_fc_temp, 'wc')
    create_toilet_poi(wc_layer, poi_fc, groups['employ'], 'zaměstnanci', True)
    create_toilet_poi(wc_layer, poi_fc, groups['immobile'], 'invalidé')
    create_toilet_poi(wc_layer, poi_fc, groups['women'], 'ženy')
    create_toilet_poi(wc_layer, poi_fc, groups['men'], 'muži')
    create_toilet_poi(wc_layer, poi_fc)
    arcpy.Delete_management(wc_fc_temp)
finally:
    arcpy.Delete_management(memory)

