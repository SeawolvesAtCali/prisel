import { SerializedWorld } from '../world';

export interface BoardSetup {
    height: number;
    width: number;
    world: SerializedWorld;
}
