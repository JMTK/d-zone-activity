'use strict';
import geometry from './../common/geometry';
import Beacon from './../props/beacon';
import Seed from './../props/seed';
import type Game from '../engine/game';
import type World from '../environment/world';

export default class Decorator {
    game: Game;
    world: World;
    beacon: Beacon;
    constructor(game, world) {
        this.game = game;
        this.world = world;
        this.createBeacon();
    }

    sewSeed(options: {
        origin: { x: number, y: number, z: number },
    }) {
        let destination;
        for (const close of geometry.closestGrids) {
            const grid = this.world.map[`${options.origin.x + close[0]!}:${options.origin.y + close[1]!}`];
            if (!grid || grid.style == 'plain') continue;
            if (this.world.objectAtXYZ(grid.position.x, grid.position.y, grid.position.z + grid.height)) continue;
            destination = grid.position;
            break;
        }
        if (!destination) return;
        const talkSeed = new Seed({
            origin: options.origin,
            destination: {
                x: destination.x,
                y: destination.y,
                z: destination.z + 0.5
            }
        });
        talkSeed.addToGame(this.game);
    }

    createBeacon() {
        //var beaconLocations = {};
        //for(var mKey in this.world.map) { if(!this.world.mKey in map) continue;
        //    if(this.world.map[mKey].style != 'plain') continue;
        //    var neighbors = geometry.getNeighbors(mKey);
        //    var isPedestal = true;
        //    for(var nKey in neighbors) { if(!nKey in neighbors) continue;
        //        if(!this.world.map[neighbors[nKey]]
        //            || this.world.map[neighbors[nKey]].position.z + 0.5 != this.world.map[mKey].position.z) {
        //            isPedestal = false; break;
        //        }
        //    }
        //    if(isPedestal) {
        //        beaconLocations = {}; beaconLocations[mKey] = this.world.map[mKey];
        //        break;
        //    } else {
        //        beaconLocations[mKey] = this.world.map[mKey];
        //    }
        //}
        //var beaconLocationKeys = Object.keys(beaconLocations);
        //beaconLocationKeys.sort(function(a,b) {
        //    var xa = Math.abs(a.split(':')[0]), ya = Math.abs(a.split(':')[1]),
        //        xb = Math.abs(b.split(':')[0]), yb = Math.abs(b.split(':')[1]);
        //    return (xa + ya) - (xb + yb);
        //});
        //var beaconLocation = beaconLocations[beaconLocationKeys[0]];
        //beaconLocation.position = { x: 0, y: 0, z: 0 };
        this.beacon = new Beacon(
            0, 0, 0
        );
        this.beacon.addToGame(this.game);
    }
}