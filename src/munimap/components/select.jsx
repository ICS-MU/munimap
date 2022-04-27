import * as actions from '../redux/action.js';
import * as mm_lang from '../lang.js';
import * as slctr from '../redux/selector.js';
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import {Feature} from 'ol';
import {FloorTypes} from '../feature/constants.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

const customStyles = (floorsWithMarkers) => {
  return {
    menu: (styles) => {
      return {
        ...styles,
        width: 'auto',
        borderRadius: 0,
        marginTop: '2px',
        minWidth: '60px',
      };
    },

    control: (styles, {isDisabled, isFocused}) => {
      return {
        ...styles,
        backgroundColor: 'white',
        borderRadius: 0,
        borderColor: isDisabled
          ? styles.borderColor
          : isFocused
          ? 'hsl(0, 0%, 80%)'
          : 'hsl(0, 0%, 80%)',
        boxShadow: 0,
        minWidth: '90px',
        minHeight: '28px',
        lineHeight: '20px',
        padding: '3px 2px 3px 10px',
        ':hover': {
          ...styles[':hover'],
          cursor: 'pointer',
          borderColor: 'hsl(0, 0%, 50%)',
          boxShadow: 0,
        },
      };
    },

    input: (styles) => {
      return {
        ...styles,
        margin: 0,
        padding: 0,
      };
    },

    dropdownIndicator: (styles) => {
      return {
        ...styles,
        margin: 0,
        padding: '0px 2px 0px 2px',
      };
    },

    valueContainer: (styles) => {
      return {
        ...styles,
        padding: '0',
      };
    },

    indicatorSeparator: (styles) => {
      return {
        ...styles,
        margin: '0',
      };
    },

    option: (styles, {isDisabled, isFocused, isSelected, data}) => {
      const withMarker = floorsWithMarkers.includes(data.value);
      return {
        ...styles,
        padding: '2px 6px',
        fontSize: '13px',
        color: isDisabled ? styles.color : withMarker ? '#e51c23' : '#000',
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? '#d6e9f8'
          : isFocused
          ? '#d6e9f8'
          : undefined,
      };
    },
  };
};

/**
 * Get abbreviated label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @param {string} lang language
 * @return {string} abbreviated floor label
 */
const getLabelAbbr = (floorCode, lang) => {
  const letter = floorCode.substring(0, 1);
  const num = parseInt(floorCode.substring(1), 10);
  let numLabel = '';
  let mezzanineNumLabel = '';
  if (lang === mm_lang.Abbr.ENGLISH) {
    numLabel = (
      letter === FloorTypes.UNDERGROUND_MEZZANINE ? num - 1 : num
    ).toString();
    mezzanineNumLabel = '.5';
  } else if (lang === mm_lang.Abbr.CZECH) {
    numLabel = (
      letter === FloorTypes.UNDERGROUND_MEZZANINE ? num - 1 : num
    ).toString();
    mezzanineNumLabel = ',5';
  }
  let label;
  let floorTypeString;
  switch (letter) {
    case FloorTypes.UNDERGROUND:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_UNDER_ABBR,
        lang
      );
      label =
        lang === mm_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel
          : numLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.UNDERGROUND_MEZZANINE:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_MEZZANINE_UNDER_ABBR,
        lang
      );
      label =
        lang === mm_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel + mezzanineNumLabel
          : numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.MEZZANINE:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_MEZZANINE_ABBR,
        lang
      );
      label =
        lang === mm_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel + mezzanineNumLabel
          : numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.ABOVEGROUND:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_ABOVE_ABBR,
        lang
      );
      label =
        lang === mm_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel
          : numLabel + '. ' + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};

/**
 * Get label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @param {string} lang language
 * @return {string} floor label
 */
const getLabel = (floorCode, lang) => {
  const letter = floorCode.substring(0, 1);
  const num = parseInt(floorCode.substring(1), 10);
  let numLabel = '';
  if (lang === mm_lang.Abbr.ENGLISH) {
    switch (num) {
      case 1:
        numLabel = num + 'st ';
        break;
      case 2:
        numLabel = num + 'nd ';
        break;
      case 3:
        numLabel = num + 'rd ';
        break;
      default:
        numLabel = num + 'th ';
        break;
    }
  } else if (lang === mm_lang.Abbr.CZECH) {
    numLabel = num + '. ';
  }
  let label;
  let floorTypeString;
  switch (letter) {
    case FloorTypes.UNDERGROUND:
      floorTypeString = mm_lang.getMsg(mm_lang.Translations.FLOOR_UNDER, lang);
      label = numLabel + floorTypeString;
      break;
    case FloorTypes.UNDERGROUND_MEZZANINE:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_MEZZANINE_UNDER,
        lang
      );
      label = floorTypeString;
      break;
    case FloorTypes.MEZZANINE:
      floorTypeString = mm_lang.getMsg(
        mm_lang.Translations.FLOOR_MEZZANINE,
        lang
      );
      label = floorTypeString;
      break;
    case FloorTypes.ABOVEGROUND:
      floorTypeString = mm_lang.getMsg(mm_lang.Translations.FLOOR_ABOVE, lang);
      label = numLabel + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};

/**
 * @type {React.FC<{floors: Array<Feature>}>}
 * @param {React.PropsWithChildren<{floors: Array<Feature>}>} props props
 * @return {React.ReactElement} React element
 */
const SelectComponent = (props) => {
  const lang = useSelector(slctr.getLang);
  const selectedFloor = useSelector(slctr.getSelectedFloorCode);
  const floorsWithMarkers = useSelector(slctr.getFloorCodesWithMarkers);
  const dispatch = useDispatch();

  const handleChange = (selectedOption) => {
    dispatch(actions.selected_feature_changed(selectedOption.value));
  };

  const floors = props.floors;
  const options = floors.map((floor) => {
    const locCode = /**@type {string}*/ (floor.get('polohKod'));
    const floorCode = locCode.slice(5, 8);
    return {
      label: (
        <span title={getLabel(floorCode, lang)}>
          {getLabelAbbr(floorCode, lang)}
        </span>
      ),
      value: locCode,
    };
  });

  return (
    <Select
      // menuIsOpen
      classNamePrefix="munimap-floor-select"
      value={selectedFloor && options.find((opt) => opt.value == selectedFloor)}
      onChange={handleChange}
      options={options}
      placeholder={mm_lang.getMsg(mm_lang.Translations.INFOBOX_CHOOSE, lang)}
      styles={customStyles(floorsWithMarkers)}
      noOptionsMessage={() => 'Žádné podlaží'}
      isSearchable={false}
    />
  );
};

SelectComponent.propTypes = {
  floors: PropTypes.arrayOf(PropTypes.instanceOf(Feature)),
};

export default hot(module)(SelectComponent);
