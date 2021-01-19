import { Packet, Response } from '@prisel/client';
import { priselpb } from '@prisel/protos';
import * as React from 'react';
import { Pill, Preset } from '../Pill';
import cn from '../utils/classname';
import styles from './index.module.css';

interface PacketTypeLabelProps {
    type: priselpb.PacketType;
}

const PacketTypeLabel: React.FC<PacketTypeLabelProps> = (props) => {
    switch (props.type) {
        case priselpb.PacketType.REQUEST:
            return <Pill preset={Preset.GREEN}>REQUEST</Pill>;
        case priselpb.PacketType.RESPONSE:
            return <Pill preset={Preset.GREEN}>RESPONSE</Pill>;
        case priselpb.PacketType.DEFAULT:
            return <Pill preset={Preset.GREEN}>PACKET</Pill>;
        default:
            return <Pill preset={Preset.GREEN}>UNKNOWN</Pill>;
    }
};

interface CollapseProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Collapse: React.FC<CollapseProps> = (props) => {
    return <span onClick={props.onToggle}>{props.collapsed ? '+' : '−'}</span>;
};

interface JsonViewInternalProps {
    value: any;
    isTopLevel?: boolean;
}

const JsonViewInternal: React.FC<JsonViewInternalProps> = (props) => {
    const { value, isTopLevel = false } = props;
    const [collapsed, setCollapsed] = React.useState(false);
    const handleCollapse = React.useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);

    if (value === undefined) {
        return <span>undefined</span>;
    }
    if (value === null) {
        return <span>null</span>;
    }
    if (typeof value === 'string') {
        return <span className={styles.string}>"{value}"</span>;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return <span className={styles.number}>{value}</span>;
    }

    const indentClassName = cn({ [styles.indent]: !isTopLevel });
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span>[]</span>;
        }
        return (
            <React.Fragment>
                {!isTopLevel && <Collapse onToggle={handleCollapse} collapsed={collapsed} />}
                <div className={indentClassName}>
                    {collapsed && <div className={styles.collapsed} />}
                    {value.map((item, index) => (
                        <div key={index} className={cn({ [styles.hidden]: collapsed })}>
                            <span className={styles.attribute}>{index}:</span>

                            <JsonViewInternal value={item} />
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    }
    if (typeof value === 'object') {
        if (Object.keys(value).length === 0) {
            return <span>{'{}'}</span>;
        }
        return (
            <React.Fragment>
                {!isTopLevel && <Collapse onToggle={handleCollapse} collapsed={collapsed} />}
                <div className={indentClassName}>
                    {collapsed && <div className={styles.collapsed} />}
                    {Object.keys(value).map((key) => (
                        <div key={key} className={cn({ [styles.hidden]: collapsed })}>
                            <span className={styles.attribute}>{key}:</span>

                            <JsonViewInternal value={value[key]} />
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    }
    return <span>unsupported</span>;
};

interface JsonViewProps {
    value: any;
}
const JsonView: React.FC<JsonViewProps> = (props) => {
    return (
        <div className={styles.json}>
            <JsonViewInternal isTopLevel value={props.value} />
        </div>
    );
};

interface PacketViewProps {
    packet: Packet;
    fromServer: boolean;
    actionToString?: (action: any) => string;
}
function getResponseStatus(packet: Packet) {
    if (Response.isResponse(packet)) {
        const response = packet;
        return Packet.isStatusOk(response) ? (
            <Pill preset={Preset.GREEN}>SUCCESS</Pill>
        ) : (
            <Pill preset={Preset.PINK}>FAILURE</Pill>
        );
    }
    return null;
}

function renderStatus(packet: Packet) {
    if (Response.isResponse(packet)) {
        const response = packet;
        return (
            <div className={styles.status}>
                <JsonView value={priselpb.Status.toJson(response.status)} />
            </div>
        );
    }
    return null;
}

export const PacketView: React.FC<PacketViewProps> = (props) => {
    const { packet: p, actionToString = (action: any) => `${action}`, fromServer } = props;

    return (
        <div>
            <div>
                {fromServer ? (
                    <span className={styles.download}>⬇</span>
                ) : (
                    <span className={styles.upload}>⬆</span>
                )}
                <PacketTypeLabel type={p.type} />
                {getResponseStatus(p)}
                {Packet.isAnySystemAction(p) && (
                    <Pill preset={Preset.DEFAULT}>
                        {
                            priselpb.SystemActionType[
                                Packet.getSystemAction(p) || priselpb.SystemActionType.UNSPECIFIED
                            ]
                        }
                    </Pill>
                )}
                {Packet.isAnyCustomAction(p) && (
                    <Pill preset={Preset.DEFAULT}>{actionToString(Packet.getAction(p))}</Pill>
                )}
            </div>
            {renderStatus(p)}
            {p.payload !== undefined && <JsonView value={p.payload} />}
        </div>
    );
};
