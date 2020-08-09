import { Property2 } from '@prisel/monopoly-common';
import React from 'react';
import { StringInput } from './StringInput';
interface PropertyEditorProps {
    property: Property2;
}
export const PropertyEditor: React.FC<PropertyEditorProps> = ({ property }) => {
    return (
        <React.Fragment>
            <StringInput
                label="name"
                key={property.id}
                autoSelect
                initialValue={property.name}
                onCommit={(name) => {
                    property.name = name;
                }}
            />
        </React.Fragment>
    );
};
