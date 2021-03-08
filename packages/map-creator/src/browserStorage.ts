import { World } from '@prisel/monopoly-common';

const WORLD_STORAGE_KEY = 'world';
export function saveToStorage(world: World) {
    saveValueToStorage(WORLD_STORAGE_KEY, JSON.stringify(world.serialize()));
}

export function readValueFromStorage(key: string): string | null {
    return window.localStorage.getItem(key);
}

export function saveValueToStorage(key: string, value: string) {
    window.localStorage.setItem(key, value);
}
export function clearValue(key: string) {
    window.localStorage.removeItem(key);
}

export function readFromStorage(bootstrappedWorld: World): World {
    const worldString = readValueFromStorage(WORLD_STORAGE_KEY);
    if (worldString) {
        return bootstrappedWorld.populate(JSON.parse(worldString));
    }
    return bootstrappedWorld;
}

export function clearSaved() {
    clearValue(WORLD_STORAGE_KEY);
}
