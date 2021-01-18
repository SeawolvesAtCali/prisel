import { GameObject, Property, Tile } from '@prisel/monopoly-common';
import React from 'react';
import styles from './App.module.css';
import { AppContext, TempSelectingConfig } from './AppContext';
import { clearSaved, saveToStorage } from './browserStorage';
import { Canvas } from './Canvas';
import { download } from './common';
import { deselectObject, selectObject } from './events';
import { PropertyEditor } from './gameObjectEditors/PropertyEditor';
import { TileEditor } from './gameObjectEditors/TileEditor';
import { useTypedEvent } from './gameObjectEditors/useTypedEvent';
import { LayerType } from './Layer';
import { toBoardSetup } from './mapExporter';
import { toolSupportedLayer, ToolType } from './tools/Tool';
import { useLocalStorage } from './useLocalStorage';
import { useWorld } from './useWorld';

export const Container: React.FC = () => {
    const [tool, setTool] = React.useState(ToolType.EMPTY_TILE_BRUSH);
    const world = useWorld();
    const [layer, setLayer] = React.useState(LayerType.TILE);
    const [width, setWidth] = useLocalStorage('map_width', 10);
    const [height, setHeight] = useLocalStorage('map_height', 10);
    const [tempSelectingConfig, setTempSelecting] = React.useState<TempSelectingConfig | undefined>(
        undefined,
    );
    const [selectedObject, setSelectedObject] = React.useState<GameObject | undefined>(undefined);
    useTypedEvent(selectObject, setSelectedObject);
    useTypedEvent(
        deselectObject,
        React.useCallback(() => setSelectedObject(undefined), [setSelectedObject]),
    );
    return (
        <div>
            <AppContext.Provider
                value={{
                    tool,
                    layer,
                    width,
                    height,
                    world,
                    selectedObject,
                    tempSelectingConfig,
                    setTempSelecting,
                    setSelectedObject,
                }}
            >
                <section>
                    <label htmlFor="width-input">width</label>
                    <input
                        id="width-input"
                        type="number"
                        value={width}
                        onChange={(e) => {
                            if (Number.parseInt(e.target.value, 10) > 0) {
                                setWidth(Number.parseInt(e.target.value, 10));
                            }
                        }}
                    />
                    <label htmlFor="height-input">height</label>
                    <input
                        id="height-input"
                        type="number"
                        value={height}
                        onChange={(e) => {
                            if (Number.parseInt(e.target.value, 10) > 0) {
                                setHeight(Number.parseInt(e.target.value, 10));
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            download(
                                'map-export.json',
                                JSON.stringify(toBoardSetup(world, width, height)),
                            );
                        }}
                    >
                        Export
                    </button>
                    <button
                        onClick={() => {
                            saveToStorage(world);
                        }}
                    >
                        Save
                    </button>
                    <button onClick={clearSaved}>Clear Saved</button>
                    <div>
                        {Object.values(ToolType).map((toolType) => (
                            <React.Fragment key={toolType}>
                                <input
                                    type="radio"
                                    id={`mode-selector-${toolType}`}
                                    name="drawing-mode"
                                    value="none"
                                    checked={tool === toolType}
                                    onChange={() => {
                                        setTool(toolType);
                                        if (!toolSupportedLayer[toolType].includes(layer)) {
                                            // current tool doesn't support layer,
                                            // auto switch to first supported layer.
                                            setLayer(toolSupportedLayer[toolType][0]);
                                        }
                                        if (
                                            toolType !== ToolType.SELECTOR &&
                                            toolType !== ToolType.PROPERTY
                                        ) {
                                            setSelectedObject(undefined);
                                        }
                                    }}
                                />
                                <label htmlFor={`mode-selector-${toolType}`}>{toolType}</label>
                            </React.Fragment>
                        ))}
                    </div>
                    <div>
                        {Object.values(LayerType).map((layerType) => (
                            <React.Fragment key={layerType}>
                                <input
                                    type="radio"
                                    disabled={toolSupportedLayer[tool].length <= 1}
                                    id={`layer-selector-${layerType}`}
                                    name="drawing-layer"
                                    value="none"
                                    checked={layer === layerType}
                                    onChange={() => {
                                        setLayer(layerType);
                                    }}
                                />
                                <label htmlFor={`layer-selector-${layerType}`}>{layerType}</label>
                            </React.Fragment>
                        ))}
                    </div>
                </section>
                <section>
                    <Canvas />
                </section>
                <section className={styles.propertyPanel}>
                    {selectedObject instanceof Tile && (
                        <TileEditor tile={selectedObject} key={selectedObject.id} />
                    )}
                    {selectedObject instanceof Property && (
                        <PropertyEditor property={selectedObject} />
                    )}
                </section>
                <section style={{ whiteSpace: 'pre' }}>
                    {selectedObject && JSON.stringify(selectedObject.serialize(), null, 2)}
                </section>
            </AppContext.Provider>
        </div>
    );
};
