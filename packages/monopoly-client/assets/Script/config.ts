declare module globalThis {
    let PRISEL_CONFIG: { [key: string]: any };
}
/**
 * Get config. Currently config is only set for production build for web mobile platform
 * @param name name of the config
 * @param defaultValue default value of the config. If it's not production build
 * or the config is not set, default value will be returned.
 */
export function getConfig<T>(name: string, defaultValue: T): T {
    if (globalThis.PRISEL_CONFIG && globalThis.PRISEL_CONFIG[name] !== undefined) {
        return globalThis.PRISEL_CONFIG[name];
    }
    return defaultValue;
}
