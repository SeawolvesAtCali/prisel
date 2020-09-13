import { Coordinate } from './coordinate';
// A pair of road and property positions. Meaning those two are connected. When
// player land on the road tile, they can purchase property or need to pay rent.
export interface CoordinatePair {
    0: Coordinate; // road
    1: Coordinate; // property
}
