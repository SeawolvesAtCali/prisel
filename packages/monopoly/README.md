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
