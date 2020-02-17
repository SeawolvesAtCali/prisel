| action | initiator | description | payload | is request/response | related actions |
|---|---|---|---|---|---|
| UNSPECIFIED |  | Default value of action |  |  |  |
| WELCOME | Server | Welcome new client connection |  |  |  |
| LOGIN | Client | Client login with username and retrieve a user ID | **request**:LoginPayload **response**:LoginResponsePayload | ✓ |  |
| JOIN | Client | Client join a room | **request**:JoinPayload **response**:RoomInfoPayload | ✓ | ROOM_STATE_CHANGE |
| ROOM_STATE_CHANGE | Server | Room state change due to players joining or leaving | **packet**:RoomChangePayload |  |  |
| CREATE_ROOM | Client | Client create a room | **request**:CreateRoomPayload **response**:RoomInfoPayload | ✓ |  |
| LEAVE | Client | Client leave a room |  | ✓ | ROOM_STATE_CHANGE |
| EXIT | Client | Client exit the game and close connection |  |  | ROOM_STATE_CHANGE |
| GAME_START | Client | Host declare game start |  | ✓ | ANNOUNCE_GAME_START |
| CHAT | Client | Client send chat message to room | **packet**:ChatPayload |  | BROADCAST |
| BROADCAST | Server | Broadcast client's message to the room | **packet**:BroadcastPayload |  | CHAT |
| ANNOUNCE_GAME_START | Server | Broadcast game start to players in the room |  |  | GAME_START |