import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as slctr from '../../redux/selector.js';
import {FullScreen} from 'ol/control';
import {MyContext} from '../../_contexts/context.jsx';
import {forwardRef, useContext, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @type {React.ForwardRefExoticComponent<
 *  React.PropsWithoutRef<any> &
 *  React.RefAttributes<HTMLDivElement>>}
 */
const FullscreenComponent = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const lang = useSelector(slctr.getLang);
  const mapRef = useContext(MyContext);
  const map = mapRef && mapRef.current;

  const parentEl = /** @type {React.MutableRefObject<HTMLDivElement>}*/ (ref)
    .current;

  useEffect(() => {
    const onClick = () => {
      dispatch(
        actions.log_action_happened({
          category: 'full-screen',
          action: 'click',
        })
      );
    };
    if (map && parentEl) {
      const fullscreen = new FullScreen({
        tipLabel: munimap_lang.getMsg(
          munimap_lang.Translations.FULLSCREEN,
          lang
        ),
        target: parentEl,
      });
      fullscreen.on(['enterfullscreen', 'leavefullscreen'], onClick);
      map.addControl(fullscreen);
      return () => {
        fullscreen.un(['enterfullscreen', 'leavefullscreen'], onClick);
        map.removeControl(fullscreen);
      };
    }
  }, [map, parentEl]);

  return null;
});

FullscreenComponent.displayName = 'FullscreenComponent';

export default FullscreenComponent;
