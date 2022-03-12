import React from 'react';
import './styles/Container.css';

const Container: React.FC<{ title: string }> = ({ title = '', children }) => (
    <div className="container">
        {title && <span className="title">{title}</span>}
        {children}
    </div>
);

export default Container;
