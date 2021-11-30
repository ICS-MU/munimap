import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as slctr from '../redux/selector.js';
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import {Feature} from 'ol';
import {getLabelAbbr} from '../ui/info.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

const customStyles = {
  menu: (styles) => {
    return {
      ...styles,
      width: 'auto',
      borderRadius: 0,
      marginTop: '2px',
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

  option: (styles, {isDisabled, isFocused, isSelected}) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? '#d6e9f8'
        : isFocused
        ? '#d6e9f8'
        : undefined,
      color: isDisabled
        ? styles.color
        : isSelected
        ? 'inherit'
        : isFocused
        ? 'inherit'
        : undefined,
    };
  },
};

const SelectComponent = (props) => {
  const lang = useSelector(slctr.getLang);
  const selectedFloor = useSelector(slctr.getSelectedFloorCode);
  const dispatch = useDispatch();

  const handleChange = (selectedOption) => {
    dispatch(actions.selected_feature_changed(selectedOption.value));
  };

  const floors = props.floors;
  const options = floors.map((floor) => {
    const locCode = /**@type {string}*/ (floor.get('polohKod'));
    const floorCode = locCode.substr(5, 8);
    return {
      label: getLabelAbbr(floorCode, lang),
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
      placeholder={munimap_lang.getMsg(
        munimap_lang.Translations.INFOBOX_CHOOSE,
        lang
      )}
      styles={customStyles}
      noOptionsMessage={() => 'Žádné podlaží'}
      isSearchable={false}
    />
  );
};

SelectComponent.propTypes = {
  floors: PropTypes.arrayOf(PropTypes.instanceOf(Feature)),
};

export default hot(module)(SelectComponent);
