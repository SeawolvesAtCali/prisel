import * as React from 'react';

export default function useContainer(className: string = '', display: boolean = true) {
    const container = React.useMemo(() => {
        const div = document.createElement('div');
        if (className) {
            div.className = className;
        }
        return div;
    }, []);

    React.useEffect(() => {
        if (display) {
            document.body.appendChild(container);
            return () => {
                document.body.removeChild(container);
            };
        }
    }, [display]);

    return container;
}
