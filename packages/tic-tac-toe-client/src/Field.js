import React, { useState, useCallback } from 'react';

export function Field(props) {
    const { fieldName, buttonText, defaultValue, onExecute } = props;
    const [value, setValue] = useState(defaultValue || '');

    const handleExecute = useCallback(() => {
        onExecute(value);
    }, [onExecute, value]);

    const handleEnter = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                handleExecute();
            }
        },
        [handleExecute],
    );

    const handleInput = useCallback((e) => {
        setValue(e.target.value);
    }, []);

    return (
        <div className="field-container">
            <label className="one-fourth-width">{fieldName}</label>
            <input
                className="half-width"
                value={value}
                onKeyPress={handleEnter}
                onChange={handleInput}
            />
            <button className="one-fourth-width" onClick={handleExecute}>
                {buttonText}
            </button>
        </div>
    );
}
