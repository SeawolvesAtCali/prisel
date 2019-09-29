export default interface Suggestion {
    type: 'command' | 'param' | 'variableParam' | 'placeholderParam';
    label: string;
    value: any;
    providerKey: string;
    key?: string;
}
