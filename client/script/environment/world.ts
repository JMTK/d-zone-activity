import util from './../common/util';
import geometry from './../common/geometry';
import Pathfinder from './../actors/pathfinder';
import Slab from './slab';
import Tile from './tile';
import TileSheet from './sheet2';
import type Game from '../engine/game';
import Canvas from '../common/bettercanvas';
import type Actor from '../actors/actor';
//const testCanvas = new Canvas(200, 100);
let unoccupiedGrids; // For faster actor placement on init

export default class World {
    game: Game;
    worldSize: number;
    worldRadius: number;
    objects: any;
    map: any;
    walkable: any;
    pathfinder: any;
    tileMap: any;
    actors: Record<string, Actor>;
    mapBounds: any;
    slab: Slab;
    staticMap: any;
    islands: any;
    mainIsland: any;

    constructor(game, worldSize) {
        this.game = game;
        this.game.world = this;
        this.worldSize = Math.max(24, Math.floor(worldSize / 2) * 2); // Must be an even number >= 24
        //this.worldSize = Math.max(12,Math.floor(worldSize/2)*2); // Must be an even number >= 24
        this.worldRadius = Math.floor(this.worldSize / 2);
        this.objects = {};
        this.map = {}; // Grid-based map to hold world tiles
        this.walkable = {}; // Grid-based map to hold walkable surfaces

        geometry.generateClosestGrids(this.worldSize);

        const noiseBig = geometry.buildNoiseMap(this.worldRadius / 3 + 1, this.worldRadius / 3 + 1);
        const noiseSmall = geometry.buildNoiseMap(this.worldRadius / 1.5 + 1, this.worldRadius / 1.5 + 1);
        const bigBlur = (noiseBig.length - 1) / this.worldSize;
        const smallBlur = (noiseSmall.length - 1) / this.worldSize;
        this.mapBounds = {
            xl: 0,
            yl: 0,
            xh: 0,
            yh: 0
        }; // TODO: Center canvas using this
        for (let tx = 0; tx < this.worldSize; tx++) for (let ty = 0; ty < this.worldSize; ty++) {
            const bigNoiseValue = geometry.getNoiseMapPoint(noiseBig, tx * bigBlur, ty * bigBlur);
            const smallNoiseValue = geometry.getNoiseMapPoint(noiseSmall, tx * smallBlur, ty * smallBlur);
            const noiseValue = (bigNoiseValue + smallNoiseValue * 2) / 3;
            //var color = 'rgba(255,255,255,'+noiseValue+')'; // Draw debug noise map
            //testCanvas.fillRect(color, tx, ty, 1, 1);
            let grid;
            const x = (tx - this.worldRadius), y = (ty - this.worldRadius);
            const farness = (this.worldRadius - (Math.abs(x) + Math.abs(y)) / 2) / this.worldRadius;
            if (noiseValue / 1.1 < farness) {
                this.mapBounds.xl = Math.min(x, this.mapBounds.xl);
                this.mapBounds.yl = Math.min(y, this.mapBounds.yl);
                this.mapBounds.xh = Math.max(x, this.mapBounds.xh);
                this.mapBounds.yh = Math.max(y, this.mapBounds.yh);
                grid = new Slab('grass', x, y, -0.5);
                grid.grid = `${x}:${y}`;
                this.map[`${x}:${y}`] = grid;
                grid.addToGame(game);
            }
        }
        this.staticMap = [];
        this.crawlMap(); // Examine map to determine islands, borders, etc
        this.createTiles(); // Create map tiles from grid intersections

        let lowestScreenX = 0, lowestScreenY = 0, highestScreenX = 0, highestScreenY = 0;
        for (const preTile of this.staticMap) {
            const preScreen = {
                x: preTile.screen.x,
                y: preTile.screen.y
            };
            preScreen.x += preTile.sprite.metrics.ox || 0;
            preScreen.y += preTile.sprite.metrics.oy || 0;
            lowestScreenX = lowestScreenX < preScreen.x ? lowestScreenX : preScreen.x;
            lowestScreenY = lowestScreenY < preScreen.y ? lowestScreenY : preScreen.y;
            highestScreenX = highestScreenX > preScreen.x ? highestScreenX : preScreen.x;
            highestScreenY = highestScreenY > preScreen.y ? highestScreenY : preScreen.y;
        }
        const bgCanvas = new Canvas(
            (highestScreenX - lowestScreenX) + 32 + 1, (highestScreenY - lowestScreenY) + 32 + 9
        );
        for (const tile of this.staticMap) {
            const screen = {
                x: tile.screen.x,
                y: tile.screen.y
            };
            screen.x += tile.sprite.metrics.ox || 0;
            screen.y += tile.sprite.metrics.oy || 0;
            screen.x -= lowestScreenX;
            screen.y -= lowestScreenY;
            bgCanvas.drawImage(
                this.game.renderer.images[tile.sprite.image], tile.sprite.metrics.x, tile.sprite.metrics.y,
                tile.sprite.metrics.w, tile.sprite.metrics.h,
                Math.round(screen.x), Math.round(screen.y), tile.sprite.metrics.w, tile.sprite.metrics.h, 1
            );
        }
        //bgCanvas.context.globalCompositeOperation = 'color';
        //bgCanvas.fill('rgba(30,30,50,0.7)');
        this.game.renderer.bgCanvas = {
            x: lowestScreenX,
            y: lowestScreenY,
            image: bgCanvas.canvas
        };
        Pathfinder.loadMap(this.walkable);
        unoccupiedGrids = Object.keys(this.map);
        unoccupiedGrids.splice(unoccupiedGrids.indexOf('0:0'), 1); // 0,0 is taken by beacon
        console.log('Created world with', Object.keys(this.map).length, 'tiles');
        // TODO: Retry if tile count is too high/low
    }

    crawlMap() {
        this.islands = [];
        const crawled = {};
        let thisIsland = 0;
        for (let x = this.mapBounds.xl; x <= this.mapBounds.xh; x++) {
            for (let y = this.mapBounds.yl; y <= this.mapBounds.yh; y++) {
                let currentTile = this.map[`${x}:${y}`]; if (!currentTile) continue;
                if (crawled[currentTile.grid]) continue; // Skip already-crawled tiles
                const neighborsToCrawl: any[] = [];
                // eslint-disable-next-line no-constant-condition
                while (true) { // Keep crawling outward until no neighbors are left
                    crawled[currentTile.grid] = currentTile;
                    if (this.islands[thisIsland]) this.islands[thisIsland].push(currentTile);
                    else this.islands.push([currentTile]);
                    let currentNeighbors = geometry.getNeighbors(currentTile.grid);
                    currentNeighbors = geometry.getNeighbors(currentTile.grid);
                    for (const iKey in currentNeighbors) {
                        if (!(iKey in currentNeighbors)) continue;
                        const neighbor = this.map[currentNeighbors[iKey]];
                        if (!neighbor) {
                            currentTile.border = true; continue;
                        }
                        if (!crawled[neighbor.grid]) neighborsToCrawl.push(neighbor);
                    }
                    if (neighborsToCrawl.length > 0) {
                        currentTile = neighborsToCrawl.pop();
                    }
                    else {
                        thisIsland++; break;
                    } // No more neighbors, this island is done
                }
            }
        }

        this.mainIsland = 0;
        for (let i = 1; i < this.islands.length; i++) {
            this.mainIsland = this.islands[i].length > this.islands[this.mainIsland].length ?
                i : this.mainIsland;
        }
        for (let i2 = 0; i2 < this.islands.length; i2++) {
            if (i2 == this.mainIsland) continue;
            for (let it = 0; it < this.islands[i2].length; it++) {
                delete this.map[this.islands[i2][it].grid];
                this.islands[i2][it].remove();
            }
        }
        // Set border tiles to slab
        for (const gKey in this.map) {
            if (!(gKey in this.map)) continue;
            const finalTile = this.map[gKey];
            if (finalTile.border) {
                finalTile.style = 'plain';
            }
            else {
                const finalNeighbors = geometry.get8Neighbors(finalTile.grid);
                for (const nKey in finalNeighbors) {
                    if (!(nKey in finalNeighbors)) continue;
                    if (!this.map[finalNeighbors[nKey]]) {
                        finalTile.style = 'plain';
                        break;
                    }
                }
            }
        }
        this.map['0:0'].style = 'plain'; // Slab around beacon
        this.map['1:0'].style = 'plain';
        this.map['-1:0'].style = 'plain';
        this.map['0:1'].style = 'plain';
        this.map['0:-1'].style = 'plain';

        // Create flower patches
        for (let fp = 0; fp < Math.ceil(Math.pow(this.worldRadius, 2) / 80); fp++) {
            let safety = 0;
            let valid = true;
            const grid = this.map[util.pickInObject(this.map)];
            do {
                const flowerNeighbors = geometry.get8Neighbors(grid.grid);
                for (const fKey in flowerNeighbors) {
                    if (!(fKey in flowerNeighbors)) continue;
                    const fNeighbor = this.map[flowerNeighbors[fKey]];
                    if (!fNeighbor || fNeighbor.style != 'grass') {
                        valid = false;
                        break;
                    }
                }
                safety++;
            } while (safety < 1000 && (grid.style != 'grass' || !valid));
            if (safety == 1000) continue;
            grid.style = 'flowers';
            const spread = util.randomIntRange(1, 4);
            for (let s = 0; s < spread; s++) {
                let canSpread = true;
                const spreadX = grid.position.x + util.randomIntRange(-1, 1),
                    spreadY = grid.position.y + util.randomIntRange(-1, 1);
                const spreadGrid = this.map[`${spreadX}:${spreadY}`];
                const spreadNeighbors = geometry.get8Neighbors(spreadGrid.grid);
                for (const sKey in spreadNeighbors) {
                    if (!(sKey in spreadNeighbors)) continue;
                    const sNeighbor = this.map[spreadNeighbors[sKey]];
                    if (!sNeighbor || (sNeighbor.style != 'grass' && sNeighbor.style != 'flowers')) {
                        canSpread = false;
                        break;
                    }
                }
                if (canSpread) spreadGrid.style = 'flowers';
            }
        }
    }

    createTiles() {
        // Tile types:
        //   Grass     G
        //   Slab      S
        //   Flowers   F
        //   Empty     E
        // Tile code constructed as NW-NE-SE-SW (eg. "S-X-X-B")

        this.tileMap = {};
        const self = this;

        function tileType(grid) {
            return self.map[grid].style[0].replace(/p/, 's').toUpperCase();
        }

        function getTileCode(oGrid, nGrid) {
            if (oGrid == nGrid) return tileType(oGrid);
            const neighbor = self.map[nGrid];
            if (!neighbor) return 'E';
            return tileType(nGrid);
        }

        function generateTile(oGrid, tile, grid, game) {
            const nGrids = tile.grids;
            const tileCode = `${getTileCode(oGrid, nGrids[0])}-${getTileCode(oGrid, nGrids[1])}-${getTileCode(oGrid, nGrids[2])}-${getTileCode(oGrid, nGrids[3])}`;
            const tileSprite = (new TileSheet('tile')).map[tileCode];
            if (!tileSprite) console.error('unknown tile code', tileCode, nGrids);
            return {
                tileCode: tileCode,
                position: tile,
                grid: grid,
                game: game
            };
        }

        for (const key in this.map) {
            if (!(key in this.map)) continue;
            const x = +key.split(':')[0]!, y = +key.split(':')[1]!, z = this.map[key].position.z;
            const neighbors = geometry.get8Neighbors(key);
            const nw = {
                x: x - 0.5,
                y: y - 0.5,
                z: z,
                grids: [neighbors.nw, neighbors.n, key, neighbors.w]
            },
                ne = {
                    x: x + 0.5,
                    y: y - 0.5,
                    z: z,
                    grids: [neighbors.n, neighbors.ne, neighbors.e, key]
                },
                se = {
                    x: x + 0.5,
                    y: y + 0.5,
                    z: z,
                    grids: [key, neighbors.e, neighbors.se, neighbors.s]
                },
                sw = {
                    x: x - 0.5,
                    y: y + 0.5,
                    z: z,
                    grids: [neighbors.w, key, neighbors.s, neighbors.sw]
                };
            const tiles = [nw, ne, se, sw];
            for (const tile of tiles) {
                const tileGrid = `${z}:${tile.x}:${tile.y}`;
                if (this.tileMap[tileGrid]) continue;
                this.tileMap[tileGrid] = new Tile(generateTile(key, tile, tileGrid, this.game));
                this.staticMap.push(this.tileMap[tileGrid]);
            }
        }
        this.staticMap.sort(function (a, b) {
            return a.zDepth - b.zDepth;
        });
    }

    addToWorld(obj) {
        //console.log('world: adding object at',obj.position.x,obj.position.y,obj.position.z);
        if (this.objects[obj.position.x]) {
            if (this.objects[obj.position.x][obj.position.y]) {
                if (this.objects[obj.position.x][obj.position.y][obj.position.z]) {
                    console.trace('occupado!', obj, this.objects);
                    return false;
                }
            }
            else {
                this.objects[obj.position.x][obj.position.y] = {};
            }
        }
        else {
            this.objects[obj.position.x] = {};
            this.objects[obj.position.x][obj.position.y] = {};
        }
        this.objects[obj.position.x][obj.position.y][obj.position.z] = obj;
        this.updateWalkable(obj.position.x, obj.position.y);
    }

    removeFromWorld(obj) {
        //console.log('world: removing object at',obj.position.x,obj.position.y,obj.position.z);
        delete this.objects[obj.position.x][obj.position.y][obj.position.z];
        this.updateWalkable(obj.position.x, obj.position.y);
    }

    moveObject(obj, x, y, z) {
        //console.log('world: moving object from',obj.position.x,obj.position.y,obj.position.z,'to',x,y,z);
        this.removeFromWorld(obj);
        obj.position.x = x; obj.position.y = y; obj.position.z = z;
        this.addToWorld(obj);
    }

    updateWalkable(x, y) {
        //console.log('world: updating walkable at',x,y);
        const objects = this.objects[x][y];
        if (!objects || Object.keys(objects).length == 0) {
            delete this.walkable[`${x}:${y}`];
            //console.log('world: ',x,y,'is now unwalkable');
            return;
        }
        const zKeys = Object.keys(objects).sort(function (a: any, b: any) {
            return a - b;
        });
        const topObject = objects[zKeys[zKeys.length - 1]!];
        if (topObject.unWalkable) {
            delete this.walkable[`${x}:${y}`];
            //console.log('world: ',x,y,'is now unwalkable');
        }
        else {
            this.walkable[`${x}:${y}`] = topObject.position.z + topObject.height;
            //console.log('world: ',x,y,'is now walkable',this.walkable[x+':'+y]);
        }
    }

    randomEmptyGrid() {
        return unoccupiedGrids.splice(util.randomIntRange(0, unoccupiedGrids.length - 1), 1)[0];
    }

    objectAtXYZ(x, y, z) {
        if (!this.objects[x]) return false;
        if (!this.objects[x][y]) return false;
        return this.objects[x][y][z];
    }

    objectUnderXYZ(x, y, z) {
        if (!this.objects[x]) return false;
        if (!this.objects[x][y]) return false;
        let highest = -1000;
        for (const zKey in this.objects[x][y]) {
            if (!(zKey in this.objects[x][y])) continue;
            if (+zKey > z) continue;
            highest = +zKey > highest ? +zKey : highest;
        }
        return this.objects[x][y][highest];
    }

    findObject(obj) { // For debugging
        for (const xKey in this.objects) {
            if (!(xKey in this.objects)) continue;
            const xObjects = this.objects[xKey];
            for (const yKey in xObjects) {
                if (!(yKey in xObjects)) continue;
                const yObjects = xObjects[yKey];
                for (const zKey in yObjects) {
                    if (!(zKey in yObjects)) continue;
                    if (obj === yObjects[zKey]) return [xKey, yKey, zKey];
                }
            }
        }
    }
}