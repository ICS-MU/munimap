import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

const InfoBubbleComponent = (props) => {
  return (
    <div className="ol-popup munimap-info" style={{zIndex: '2'}}>
      {props.children}
    </div>
  );
};

InfoBubbleComponent.propTypes = {
  children: PropTypes.node,
};

export default InfoBubbleComponent;
