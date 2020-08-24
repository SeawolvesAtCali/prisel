import { genId } from '@prisel/monopoly-common';
import React from 'react';
import { Divider } from './Divider';
import { SubPanel } from './SubPanel';

interface ListEditorProps {
    list: unknown[];
    itemRenderer: (item: any) => React.ReactElement | null;
    itemInitializer?: (onAddItem: (item: any) => void) => React.ReactElement;
}

export const ListEditor: React.FC<ListEditorProps> = ({ list, itemRenderer, itemInitializer }) => {
    const initialKeyList = React.useMemo(() => list.map(() => genId()), [list]);
    const [keyList, setKeyList] = React.useState(initialKeyList);

    return (
        <div>
            <button
                onClick={() => {
                    list.length = 0;
                    setKeyList([]);
                }}
            >
                clear
            </button>
            {list.map((item, index) => (
                <React.Fragment key={keyList[index]}>
                    <Divider />
                    <SubPanel>
                        <button
                            onClick={() => {
                                list.splice(index, 1);
                                setKeyList(keyList.filter((key) => key !== keyList[index]));
                            }}
                        >
                            remove
                        </button>
                        {itemRenderer(item)}
                    </SubPanel>
                </React.Fragment>
            ))}

            {itemInitializer && (
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
