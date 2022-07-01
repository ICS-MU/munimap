import FullScreenComponent from './fullscreen.jsx';
import InitExtentComponent from './initextent.jsx';
import MapContext from '../../contexts/mapcontext.jsx';
import PropTypes from 'prop-types';
import {Control} from 'ol/control.js';
import {forwardRef, useContext, useEffect} from 'react';

/**
 * @type {React.ForwardRefExoticComponent<
 *  React.PropsWithoutRef<{visible: boolean, horizontal: boolean}> &
 *  React.RefAttributes<HTMLDivElement>>}
 */
const ToolbarComponent = forwardRef((props, ref) => {
  const {visible, horizontal} = props;

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;
  //ForwardRefRenderFunction<T, P>
  const toolBarEl =
    ref && /** @type {React.MutableRefObject<HTMLDivElement>}*/ (ref).current;

  useEffect(() => {
    let toolBarControl;
    if (map && toolBarEl && !horizontal) {
      toolBarControl = new Control({
        element: toolBarEl,
      });
    }

    return () => {
      if (toolBarControl) {
        toolBarControl = undefined;
      }
    };
  }, [map, horizontal, toolBarEl]);

  const className =
    'ontouchstart' in window ? 'ol-touch munimap-tool-bar' : 'munimap-tool-bar';

  return (
    <div
      className={`${className}${!horizontal ? ' default' : ' nested'}`}
      ref={ref}
      style={{display: visible ? '' : 'none'}}
    >
      <InitExtentComponent ref={ref} />
      {horizontal && <div className="munimap-vertical-line"></div>}
      <FullScreenComponent ref={ref} />
    </div>
  );
});

ToolbarComponent.displayName = 'ToolbarComponent';

ToolbarComponent.propTypes = {
  visible: PropTypes.bool.isRequired,
  horizontal: PropTypes.bool.isRequired,
};

export default ToolbarComponent;
