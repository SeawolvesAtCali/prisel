import { create as createNode } from '../Node';
import { create as createProperty } from '../Property';
import genId from '../genId';

const nodeList = [
    null,
    ['Medierranean Avenue', 60],
    ['Baltic Avenue', 60],
    ['Oriental Avenue', 100],
    ['Vermont Avenue', 100],
    ['Connecticut Avenue', 120],
    ['St. Charles Place', 140],
    ['States Avenue', 140],
    ['Virginia Avenue', 160],
    ['St.James Place', 180],
    ['Tennessee Avenue', 180],
    ['New York Avenue', 200],
    ['Kentucky Avenue', 220],
    ['Indiana Avenue', 220],
    ['Illinois Avenue', 240],
    ['Atlantic Avenue', 260],
    ['Ventnor Avenue', 260],
    ['Marvin Gardens', 280],
    ['Parcific Avenue', 300],
    ['North Carolina Avenue', 300],
    ['Pennsylvania Avenue', 320],
    ['Park Place', 350],
    ['Boardwalk', 400],
];
function createBoard() {
    const map = Array.from({ length: 20 }).map((ele, index) =>
        createNode({
            id: genId(),
            property: nodeList[index]
                ? createProperty({
                      id: genId(),
                      price: nodeList[index][1] as number,
                      rent: 100,
                      name: nodeList[index][0] as string,
                  })
                : undefined,
        }),
    );

    for (let i = 0; i < map.length; i++) {
        if (map[i - 1]) {
            map[i].prev = map[i - 1];
        }
        if (map[i + 1]) {
            map[i].next = map[i + 1];
        }
    }

    map[0].prev = map[map.length - 1];
    map[map.length - 1].next = map[0];
    return map[0];
}

export default createBoard;
