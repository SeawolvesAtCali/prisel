import { Coordinate } from './coordinate';

export interface PropertyLevel {
    // The cost to reach this level from previous level
    // If this is the first level, the cost is land purchase cost
    cost: number;
    rent: number;
}
export interface PropertyInfo {
    levels?: PropertyLevel[];
    currentLevel?: number;
    cost?: number; // the cost to upgrade to this level
    rent?: number; // the rent of this level
    name: string;
    pos: Coordinate;
    isUpgrade?: boolean;
}
