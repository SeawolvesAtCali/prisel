import { Tile } from '@prisel/monopoly-common';

// Extra is additional information to be passed to the next state. Similar to
// Android intent extra, we can assign any type to extra. This prevents
// different states from depending on each other,
// This file contains the types for extras.
// Extras are named after the state name, i.e. [State]Extra.

export type MovingExtra =
    | {
          type: 'usingSteps';
          steps: number;
      }
    | {
          // using Tiles disables TileEffects that adds additional steps before
          // reaching the target.
          type: 'usingTiles';
          tiles: Tile[];
      }
    | {
          type: 'usingTeleport';
          target: Tile;
      };
