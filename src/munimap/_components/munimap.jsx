import * as slctr from '../redux/selector.js';
import LoadingMessage from './loadingmessage.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from "react-dom";
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

const MunimapComponent = (props) => {
  const addMsg = useSelector(slctr.toggleLoadingMessage);
  return (
    <>
      {addMsg && <LoadingMessage />}
      <div className="munimap">{props.children}</div>
    </>
  );
};

MunimapComponent.propTypes = {
  children: PropTypes.node,
};

export default hot(module)(MunimapComponent);
