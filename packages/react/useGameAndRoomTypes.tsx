import * as React from 'react';
import { Client, MessageType } from '@prisel/client';
import { isFeedback } from '@prisel/common';
import { getGameAndRoomType } from '@prisel/client/message';

function useGameAndRoomTypes(client: Client) {
    const [gameTypes, setGameTypes] = React.useState([] as string[]);
    const [roomTypes, setRoomTypes] = React.useState([] as string[]);
    const [isLoading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (client) {
            client
                .once(
                    (messageType, data) =>
                        messageType === MessageType.SUCCESS &&
                        isFeedback(data) &&
                        data.action === MessageType.GET_GAME_AND_ROOM_TYPES,
                )
                .then((response) => {
                    // tslint:disable-next-line:no-console
                    console.log(response);
                    setGameTypes(response.gameTypes as string[]);
                    setRoomTypes(response.roomTypes as string[]);
                    setLoading(false);
                });
            client.emit(...getGameAndRoomType());
        }
    }, [client]);

    return {
        gameTypes,
        roomTypes,
        isLoading,
    };
}

export default useGameAndRoomTypes;
