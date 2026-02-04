
let map: any;

export default {
    loadMap: function (m: any) {
        map = m;
    },
    findPath: function (options: any) {
        const start = options.start, end = options.end;
        if (start.x == end.x && start.y == end.y || !(map[`${end.x}:${end.y}`] >= 0)) return [];
        const startH = calcH(end, start);
        let current = {
            x: start.x,
            y: start.y,
            grid: `${start.x}:${start.y}`,
            g: 0,
            h: startH,
            f: startH
        };
        let startIsCurrent = true;
        let openCount = 0;
        const open: { [key: string]: any } = {}, closed: any = {};
        // Add starting grid to open list
        open[current.grid] = current; openCount++;
        while (openCount > 0) {
            closed[current.grid] = current;
            delete open[current.grid]; openCount--;
            // Check if ending reached
            if (current.x == end.x && current.y == end.y) {
                return constructPath(start, current, closed);
            }
            // Add neighbors
            for (let nx = -1; nx <= 1; nx++) {
                for (let ny = -1; ny <= 1; ny++) {
                    // Skip self and diagonals
                    if ((nx == 0 && ny == 0) || Math.abs(nx) + Math.abs(ny) > 1) continue;
                    const neighbor: any = {
                        parent: current.grid,
                        x: +current.x + nx,
                        y: +current.y + ny,
                        grid: `${+current.x + nx}:${+current.y + ny}`
                    };
                    // If grid is walkable and not closed
                    if (map[neighbor.grid] >= 0 && !closed[neighbor.grid]) {
                        // Subtract own height from Z if on starting grid
                        const currentZ = startIsCurrent ? map[current.grid] - 0.5 : map[current.grid];
                        if (Math.abs(currentZ - map[neighbor.grid]) > 0.5) continue;
                        neighbor.g = current.g + 10;
                        neighbor.h = calcH(end, neighbor); neighbor.f = neighbor.g + neighbor.h;
                        const existing = open[neighbor.grid];
                        if (existing) { // If neighbor was already checked
                            if (existing.g > neighbor.g) { // If this G is better
                                existing.g = neighbor.g; existing.f = existing.g + existing.h;
                                existing.parent = current.grid;
                            }
                        }
                        else { // Neighbor is a new square
                            open[neighbor.grid] = neighbor; openCount++;
                        }
                    }
                }
            }
            current = getBest(open);
            startIsCurrent = false;
        }
        return [];
    }
};

const calcH = function (a: any, b: any) {
    const x = Math.abs(a.x - b.x), y = Math.abs(a.y - b.y);
    if (x > y) return 8 * y + 5 * x; else return 8 * x + 5 * y;
};

const getBest = function (list: any) {
    let best;
    for (const key in list) {
        if (!(key in list)) continue;
        if (!best || best.f > list[key].f) best = list[key];
    }
    return best;
};

const constructPath = function (start: any, current: any, closed: any) {
    const path: { x: number, y: number, z: number }[] = [];
    let cur = current;
    while ((!cur.x == start.x && cur.y == start.y)) {
        path.push({
            x: cur.x,
            y: cur.y,
            z: map[`${cur.x}:${cur.y}`]
        });
        cur = closed[cur.parent];
    }
    return path.reverse();
};