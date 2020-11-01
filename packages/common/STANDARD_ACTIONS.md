| action | initiator | description | payload | is request/response | related actions |
|---|---|---|---|---|---|
| UNSPECIFIED |  | Default value of action |  |  |  |
| WELCOME | Server | Welcome new client connection |  |  |  |
| LOGIN | Client | Client login with username and retrieve a user ID | **request**:type.googleapis.com/prisel.LoginRequest **response**:type.googleapis.com/prisel.LoginResponse | ✓ |  |
| JOIN | Client | Client join a room | **request**:type.googleapis.com/prisel.JoinRequest **response**:type.googleapis.com/prisel.JoinResponse | ✓ | ROOM_STATE_CHANGE |
| CREATE_ROOM | Client | Client create a room | **request**:type.googleapis.com/prisel.CreateRoomRequest **response**:type.googleapis.com/prisel.CreateRoomResponse | ✓ |  |
| LEAVE | Client | Client leave a room |  | ✓ | ROOM_STATE_CHANGE |
| EXIT | Client | Client exit the game and close connection |  |  | ROOM_STATE_CHANGE |
| GAME_START | Client | Host declare game start |  | ✓ | ANNOUNCE_GAME_START |
| CHAT | Client | Client send chat message to room | **packet**:type.googleapis.com/prisel.ChatPayload |  | BROADCAST |
| BROADCAST | Server | Broadcast client's message to the room | **packet**:type.googleapis.com/prisel.BroadcastPayload |  | CHAT |
| ROOM_STATE_CHANGE | Server | Room state change due to players joining or leaving | **packet**:type.googleapis.com/prisel.RoomStateChangePayload |  |  |
| ANNOUNCE_GAME_START | Server | Broadcast game start to players in the room |  |  | GAME_START |
| ERROR | Server | Report error to client, usually responding to a packet. If an error is related to a request, a response should be used instead. | **packet**:type.googleapis.com/prisel.ErrorPayload |  |  |
| GET_ROOM_STATE | Client | Client request a snapshot of current room state. | **response**:type.googleapis.com/prisel.GetRoomStateResponse | ✓ |  |
| GET_LOBBY_STATE | Client | Client request a snapshot of current lobby state. | **response**:type.googleapis.com/prisel.GetLobbyStateResponse | ✓ |  |