import { Player } from './player';

export interface TurnOrder {
    /**
     * Return the current player. If currentPlayer is removed, return undefined.
     */
    getCurrentPlayer(): Player | undefined;

    /**
     * Returns a list of all players.
     */
    getAllPlayers(): Player[];

    /**
     * return the next player after the given player. If the given player does
     * not exit, return undefined.
     * @param player
     */
    getNextPlayerOf(player: Player): Player | undefined;

    /**
     * move the pointer to the next player specified by getNextPlayerOf so that
     * next call to getCurrentPlayer will return the next player.
     */
    giveTurnToNext(): void;

    /**
     * Remove the player from the underlying players object.
     * @param player
     * @returns true if successfully removed.
     */
    removePlayer(player: Player): boolean;

    /**
     * Add the player to the order.
     * @param newPlayer
     * @param predicate
     */
    addPlayer(newPlayer: Player): void;

    size: number;
}

interface PlayerNode {
    player: Player;
    next: PlayerNode;
    prev: PlayerNode;
}

export class RoundRobin implements TurnOrder {
    private currentPlayerNode: PlayerNode | undefined;
    private length = 0;

    constructor(players: Player[]) {
        const playerNodeList: Array<Partial<PlayerNode>> = players.map((player) => ({ player }));
        const length = playerNodeList.length;
        for (let i = 0; i < length; i++) {
            playerNodeList[i].next = playerNodeList[(i + 1) % length] as PlayerNode;
            playerNodeList[i].prev = playerNodeList[(i - 1 + length) % length] as PlayerNode;
        }
        this.currentPlayerNode = playerNodeList[0] as PlayerNode;
        this.length = length;
    }

    get size() {
        return this.length;
    }

    getAllPlayers(): Player[] {
        let current = this.currentPlayerNode;
        if (!current) {
            return [];
        }
        const list: Player[] = [];
        for (let i = 0; i < this.length; i++) {
            list.push(current.player);
            current = current.next;
        }
        return list;
    }

    removePlayer(player: Player): boolean {
        let currentPlayer = this.currentPlayerNode;
        if (!currentPlayer) {
            return false;
        }
        if (currentPlayer.player === player) {
            this.currentPlayerNode = undefined;
            this.length = 0;
            return false;
        }
        let attempt = this.length;
        while (attempt > 0) {
            if (currentPlayer.player === player && currentPlayer.next !== currentPlayer.prev) {
                currentPlayer.prev.next = currentPlayer.next;
                currentPlayer.next.prev = currentPlayer.prev;
                this.length--;
                return true;
            }
            attempt--;
        }
        return false;
    }

    addPlayer(newPlayer: Player): void {
        const currentPlayer = this.currentPlayerNode;
        if (!currentPlayer) {
            const playerNode: Partial<PlayerNode> = {
                player: newPlayer,
            };
            playerNode.next = playerNode as PlayerNode;
            playerNode.prev = playerNode as PlayerNode;
            this.currentPlayerNode = playerNode as PlayerNode;
            this.length = 1;
            return;
        }
        // add the player before the current player
        const playerNode: PlayerNode = {
            player: newPlayer,
            prev: currentPlayer.prev,
            next: currentPlayer,
        };

        currentPlayer.prev.next = playerNode;
        currentPlayer.prev = playerNode;
        this.length++;
    }

    getCurrentPlayer(): Player | undefined {
        return this.currentPlayerNode?.player;
    }

    private getPlayerNode(player: Player): PlayerNode | undefined {
        let attempt = this.length;
        let current = this.currentPlayerNode;
        if (!current) {
            return undefined;
        }
        while (attempt > 0) {
            if (current.player === player) {
                return current;
            }
            attempt--;
            current = current.next;
        }
        return undefined;
    }

    getNextPlayerOf(player: Player): Player | undefined {
        const foundPlayerNode = this.getPlayerNode(player);
        return foundPlayerNode?.next.player;
    }

    giveTurnToNext(): void {
        this.currentPlayerNode = this.currentPlayerNode?.next;
    }
}
