## Cards

```json
{
  "Spy": 0,
  "Guard": 1,
  "Priest": 2,
  "Baron": 3,
  "Handmaid": 4,
  "Prince": 5,
  "Chancellor": 6,
  "King": 7,
  "Countess": 8,
  "Princess": 9
}
```

## Game object stored in backend

```json
{
  "deck": [...],
  "players": {
    "12345": {
      "name": "Player 1",
      "cards": [...],
      "handmaidProtected": false,
      "outOfRound": false,
      "gameScore": 3
    },
    "24680": {
      "name": "Player 2",
      "cards": [...],
      "handmaidProtected": false,
      "outOfRound": false,
      "gameScore": 1
    }
  },
  "game": {
    "started": true,
    "playerTurnId": "12345",
    "winningSpyPlayerId": null,
    ... // see below
  }
}
```

## General structure

```json
{
  // frontend doesn't need to know the full deck, only the count
  "deckCount": 21,
  "players": {
    "12345": {
      "name": "Player 1",
      "cards": [...], // Array if current player, otherwise null
      "handmaidProtected": false,
      "outOfRound": false,
      "gameScore": 3
    }
  },
  "game": {
    "started": true,
    "playerTurnId": "12345",
    ...
  }
}
```

Options waiting for selection will be `null`. Does not apply to `"details"`.

### Spy

```json
{
  "game": {
    ...
    "cardPlayed": "Spy",
    "details": null
  }
}
```

### Guard

```json
{
  "game": {
    ...
    "cardPlayed": "Guard",
    "details": {
      "chosenPlayerId": "24680",
      "card": "Priest",
      "submitted": true
    }
  }
}
```

### Priest

```json
{
  "game": {
    ...
    "cardPlayed": "Priest",
    "details": {
      "chosenPlayerId": "24680",
      "submitted": true
    }
  }
}
```

### Baron

```json
{
  "game": {
    ...
    "cardPlayed": "Baron",
    "details": {
      "chosenPlayerId": "24680",
      "winningPlayerId": "12345", // determined by backend, sent to frontend for display
      "submitted": true
    }
  }
}
```

### Handmaid

```json
{
  "game": {
    ...
    "cardPlayed": "Handmaid",
    "details": null
  }
}
```

### Prince

```json
{
  "game": {
    ...
    "cardPlayed": "Prince",
    "details": {
      "chosenPlayerId": "24680",
      "submitted": true
    }
  }
}
```

### Chancellor

```json
{
  "game": {
    ...
    "cardPlayed": "Chancellor",
    "details": {
      "deckOptions": [
        "Prince",
        "Priest",
        "Guard"
      ],
      "chosenCard": "Prince"
    }
  }
}
```

### King

```json
{
  "game": {
    ...
    "cardPlayed": "King",
    "details": {
      "chosenPlayerId": "24680",
      "submitted": true
    }
  }
}
```

### Countess

```json
{
  "game": {
    ...
    "cardPlayed": "Countess",
    "details": null
  }
}
```

### Princess

```json
{
  "game": {
    ...
    "cardPlayed": "Princess",
    "details": null
  }
}
```
