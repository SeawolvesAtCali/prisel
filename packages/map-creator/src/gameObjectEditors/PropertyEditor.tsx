import { Property } from '@prisel/monopoly-common';
import React from 'react';
import { Divider } from './Divider';
import styles from './Editor.module.css';
import { PropertyLevelsEditor } from './PropertyLevelsEditor';
import { StringInput } from './StringInput';

interface PropertyEditorProps {
    property: Property;
}
export const PropertyEditor: React.FC<PropertyEditorProps> = ({ property }) => {
    return (
        <div className={styles.container}>
            <StringInput
                label="name"
                key={property.id}
                autoSelect
                initialValue={property.name}
                onCommit={(name) => {
                    property.name = name;
                }}
            />
            <Divider />
            <PropertyLevelsEditor propertyLevels={property.levels} />
        </div>
    );
};
