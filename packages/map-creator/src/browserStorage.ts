import { World } from '@prisel/monopoly-common';

export function saveToStorage(world: World) {
    window.localStorage.setItem('world', JSON.stringify(world.serialize()));
}

export function readFromStorage(bootstrappedWorld: World): World {
    const worldString = window.localStorage.getItem('world');
    if (worldString) {
        return bootstrappedWorld.deserialize(JSON.parse(worldString));
    }
    return bootstrappedWorld;
}

export function clearSaved() {
    window.localStorage.removeItem('world');
}
