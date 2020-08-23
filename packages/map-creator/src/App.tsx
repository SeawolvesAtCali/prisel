import { GameObject, PropertyClass, TileClass } from '@prisel/monopoly-common';
import * as React from 'react';
import { AppContext } from './AppContext';
import { Canvas } from './Canvas';
import { download } from './common';
import { PropertyEditor } from './gameObjectEditors/PropertyEditor';
import { TileEditor } from './gameObjectEditors/TileEditor';
import { LayerType } from './Layer';
import { toBoardSetup } from './mapExporter';
import { toolSupportedLayer, ToolType } from './tools/Tool';
import { useWorld } from './useWorld';

export const Container: React.FC = () => {
    const [tool, setTool] = React.useState(ToolType.EMPTY_TILE_BRUSH);
    const world = useWorld();
    const [layer, setLayer] = React.useState(LayerType.TILE);
    const [width, setWidth] = React.useState(10);
    const [height, setHeight] = React.useState(10);
    const [selectedObject, setSelectedObject] = React.useState<GameObject | undefined>(undefined);
    return (
        <div>
            <AppContext.Provider
                value={{ tool, layer, width, height, world, selectedObject, setSelectedObject }}
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
                <section>
                    {selectedObject instanceof TileClass && <TileEditor tile={selectedObject} />}
                    {selectedObject instanceof PropertyClass && (
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
