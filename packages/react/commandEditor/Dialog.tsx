import * as React from 'react';
import * as ReactDOM from 'react-dom';
import useContainer from '../utils/useContainer';

interface DialogProp {
    containerClass?: string;
    children: any;
    open?: boolean;
    onClose?: () => void;
}
function Dialog(props: DialogProp) {
    const { children, open = false, onClose = () => {}, containerClass } = props;
    const container = useContainer(containerClass, open);
    const ref = React.useRef(null);
    const handleClick = React.useCallback(
        (e) => {
            if (e.target === ref.current && onClose) {
                onClose();
            }
        },
        [onClose],
    );

    return open
        ? ReactDOM.createPortal(
              <div ref={ref} onClick={handleClick} className="command-editor-drop-shadow">
                  {children}
              </div>,
              container,
          )
        : null;
}

export default Dialog;
