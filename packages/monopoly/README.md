# `@prisel/monopoly`

## Messages

### Server to client

Server message might contains secret in the payload. The secret is JWT token with information for
what request a player can issue.

```
// request player to start turn, also notify other players
type: "MESSAGE",
payload: {
    type: "start_turn",
    player: "PLAYER-1"
}
```

### Client to server

```
// Roll
type: "MESSAGE",
payload: {
    type: "roll"
}

// Purchase
type: "MESSAGE",
payload: {
    type: "purchase"
}

// Conclude current turn
type: "MESSAGE",
payload: {
    type: "end_turn"
}
```
