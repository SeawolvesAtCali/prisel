# `@prisel/monopoly`

## Messages

### Server to client

Server message might contains secret in the payload. The secret is JWT token with information for
what request a player can issue.

```
// Request a roll
type = 'requestRoll',
secret: string // roll

// Move according to the number on the dice
type = 'move',
secret: string, // purchase, endTurn
payload = {
    steps: number,
}
```

### Client to server

```
// Roll
type = 'roll',
secret: string // the secret from requestRoll

// Purchase
type = 'purchase',
secret: string // the secret from move

// Conclude current turn
type = 'endTurn',
secret: string // the secret from move
```
