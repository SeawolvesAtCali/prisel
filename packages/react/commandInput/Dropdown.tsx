import * as ReactDOM from 'react-dom';
import * as React from 'react';
import debounce from 'lodash/debounce';
import useContainer from '../utils/useContainer';
import './style.css';

interface DropdownProps {
    open?: boolean;
    children?: any;
    target?: React.MutableRefObject<HTMLDivElement>;
    onClickOutside?: (e: MouseEvent, clickedOnTarget: boolean) => void;
    sameWidth?: boolean;
}

function rawAlignDropdown(target: HTMLDivElement, self: HTMLDivElement, sameWidth: boolean) {
    if (!target || !self) {
        return;
    }
    const { bottom, left } = target.getBoundingClientRect();
    self.style.top = `${bottom}px`;
    self.style.left = `${left}px`;
    if (sameWidth) {
        self.style.width = `${target.offsetWidth}px`;
    } else {
        delete self.style.width;
    }
}
const alignDropdown = debounce(rawAlignDropdown, 100);

function Dropdown(props: DropdownProps, ref: React.Ref<unknown>) {
    const { target, sameWidth = false, children = null, open, onClickOutside } = props;
    const dropdownContainer = useContainer('command-input-dropdown-container');
    React.useEffect(() => {
        if (open) {
            const updatePosition = () => {
                if (target.current) {
                    alignDropdown(target.current, dropdownContainer, sameWidth);
                }
            };
            updatePosition();
            window.addEventListener('resize', updatePosition);
            document.addEventListener('scroll', updatePosition);
            return () => {
                window.removeEventListener('resize', updatePosition);
                document.removeEventListener('scroll', updatePosition);
            };
        }
    }, [open]);
    React.useEffect(() => {
        if (open && onClickOutside) {
            const listenClickOutside = (e: MouseEvent) => {
                const clickedOutsideContainer = !dropdownContainer.contains(e.target as Node);
                const clickedOnTarget = target.current && target.current.contains(e.target as Node);
                if (clickedOutsideContainer) {
                    onClickOutside(e, clickedOnTarget);
                }
            };
            document.addEventListener('click', listenClickOutside);
            return () => {
                document.removeEventListener('click', listenClickOutside);
            };
        }
    }, [onClickOutside, target, open]);
    React.useImperativeHandle(ref, () => ({
        align: () => {
            alignDropdown(target.current, dropdownContainer, sameWidth);
        },
    }));
    return open ? ReactDOM.createPortal(children, dropdownContainer) : null;
}
export default React.forwardRef(Dropdown);
