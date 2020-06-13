common data shared between monopoly server and client side.

# Animation

Animations are packets from server to instruct client to play some animation. Some animations are

| name         | description                                  |
| ------------ | -------------------------------------------- |
| `game_start` | animation play on game start                 |
| `dice_roll`  | dice roll animation                          |
| `dice_down`  | dice drop and review final number            |
| `move`       | player move along tile path                  |
| `focus_land` | highlight the property for purchase          |
| `invested`   | show animation for purchase/update           |
| `pan`        | pan camera to next player                    |
| `turn_start` | current player play ready to start animation |
