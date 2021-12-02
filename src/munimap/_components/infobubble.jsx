import * as slctr from '../redux/selector.js';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import Select from './select.jsx';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {POPUP_TALE_INDENT, getInfoBoxPosition} from '../ui/info.js';
import {sort as floorSortFn} from '../feature/floor.js';
import {useSelector} from 'react-redux';

const InfoBubbleComponent = (props) => {
  const showInfoEl = useSelector(slctr.showInfoEl);
  const floors = useSelector(slctr.getFloorsByBuildingCode);
  const extent = useSelector(slctr.getExtent);
  const resolution = useSelector(slctr.getResolution);
  const selectedFeature = useSelector(slctr.getSelectedFeature);
  const {bldgTitle, complexTitle} = useSelector(slctr.getBuildingTitle);

  if (floors.length > 0) {
    floors.sort(floorSortFn);
  }

  const bubbleRef = useRef(null);
  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## INFOBUBBLE-useEffect');
    }
    if (bubbleRef.current && props.getPixelFromCoordinate) {
      const opts = {extent, resolution, selectedFeature};
      const positionInfo = getInfoBoxPosition(bubbleRef.current, opts);
      if (positionInfo) {
        const position = positionInfo.coordinate
          ? props.getPixelFromCoordinate(positionInfo.coordinate)
          : positionInfo.position;

        if (position && position.length > 0) {
          const left = !positionInfo.hideTale
            ? (position[0] -= POPUP_TALE_INDENT)
            : position[0];
          const top = position[1];
          bubbleRef.current.style.left = left + 'px';
          bubbleRef.current.style.top = top + 'px';
          positionInfo.hideTale
            ? bubbleRef.current.classList.add('munimap-hide-tale')
            : bubbleRef.current.classList.remove('munimap-hide-tale');
        }
      }
      bubbleRef.current.style.display = showInfoEl ? '' : 'none';
    }
  });

  if (ENABLE_RENDER_LOGS) {
    console.log('########## INFOBUBBLE-render');
  }

  return (
    <div
      className="ol-popup munimap-info"
      style={{zIndex: '2', display: 'none'}}
      ref={bubbleRef}
    >
      <div className="munimap-complex">{complexTitle}</div>
      <div className="munimap-building">{bldgTitle}</div>
      <div className="munimap-floor">
        <div className="munimap-floor-select">
          <Select floors={floors} />
        </div>
      </div>
    </div>
  );
};

InfoBubbleComponent.displayName = 'InfoBubbleComponent';
InfoBubbleComponent.propTypes = {
  getPixelFromCoordinate: PropTypes.func,
};

export default InfoBubbleComponent;
