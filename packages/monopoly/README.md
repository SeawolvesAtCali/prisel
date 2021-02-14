# `@prisel/monopoly`

## Messages

### Server to client

Server message might contains secret in the payload. The secret is JWT token with information for
what request a player can issue.

```
// request player to start turn, also notify other players
action: player_start_turn
payload: {
    id: "PLAYER-1"
}
```

### Client to server

```
// Roll
action: roll

// Purchase
action: purchase

// Conclude current turn
action: end_turn
```

### TileEffect

TileEffects are used to apply special effects to tiles, when user entering/stopping or leaving the
tile, the effect might activate. A tile has at most 1 TileEffect at a time. A TileEffect can be
activated at at most 1 timing (Entering/stopping/leaving).

All effects happens at PreRolled state. If a player is currently moving according to dice roll, an
effect might cancel the rest of the moves
