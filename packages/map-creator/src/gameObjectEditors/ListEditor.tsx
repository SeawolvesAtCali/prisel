import { genId } from '@prisel/monopoly-common';
import React from 'react';
import { Divider } from './Divider';
import { SubPanel } from './SubPanel';

interface ListEditorProps {
    list: unknown[];
    itemRenderer: (item: any, index: number) => React.ReactElement | null;
    itemInitializer?: (onAddItem: (item: any) => void) => React.ReactElement;
    fixedLength?: boolean;
}

export const ListEditor: React.FC<ListEditorProps> = ({
    list,
    itemRenderer,
    itemInitializer,
    fixedLength = false,
}) => {
    const initialKeyList = React.useMemo(() => list.map(() => genId()), [list]);
    const [keyList, setKeyList] = React.useState(initialKeyList);

    return (
        <div>
            {fixedLength || (
                <button
                    onClick={() => {
                        list.length = 0;
                        setKeyList([]);
                    }}
                >
                    clear
                </button>
            )}
            {list.map((item, index) => (
                <React.Fragment key={keyList[index]}>
                    <Divider />
                    <SubPanel>
                        {fixedLength || (
                            <button
                                onClick={() => {
                                    list.splice(index, 1);
                                    setKeyList(keyList.filter((key) => key !== keyList[index]));
                                }}
                            >
                                remove
                            </button>
                        )}
                        {itemRenderer(item, index)}
                    </SubPanel>
                </React.Fragment>
            ))}

            {itemInitializer && !fixedLength && (
                <React.Fragment>
                    <Divider />
                    {itemInitializer((item) => {
                        list.push(item);
                        setKeyList([...keyList, genId()]);
                    })}
                </React.Fragment>
            )}
        </div>
    );
};
