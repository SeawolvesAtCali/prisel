import * as ReactDOM from 'react-dom';
import * as React from 'react';
import debounce from 'lodash/debounce';
import './style.css';

interface DropdownProps {
    open?: boolean;
    children?: any;
    target?: React.MutableRefObject<HTMLDivElement>;
    sameWidth?: boolean;
}

function useDomContainer() {
    const container = React.useMemo(() => {
        const div = document.createElement('div');
        div.className = 'command-input-dropdown-container';
        return div;
    }, []);
    return container;
}

function rawAlignDropdown(target: HTMLDivElement, self: HTMLDivElement, sameWidth: boolean) {
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

function Dropdown(props: DropdownProps) {
    const { target, sameWidth = false, children = null, open } = props;
    const dropdownContainer = useDomContainer();

    React.useEffect(() => {
        document.body.appendChild(dropdownContainer);
        return () => {
            document.body.removeChild(dropdownContainer);
        };
    });

    React.useEffect(() => {
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
    });
    return open ? ReactDOM.createPortal(children, dropdownContainer) : null;
}
export default Dropdown;
