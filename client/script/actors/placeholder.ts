'use strict';
import WorldObject from '../engine/worldobject';

export default class Placeholder extends WorldObject {
    parent: any;
    invisible: boolean;
    image: any;
    metrics: any;
    unWalkable: boolean;
    constructor(parent : any, options: { x: number, y: number, z: number }) {
        super({
            position: { x: options.x, y: options.y, z: options.z },
            pixelSize: { x: 0, y: 0, z: 0 },
            height: 0.5
        });
        this.parent = parent;
        this.invisible = true;
        this.unWalkable = true;
        this.addToGame(this.parent.game);
    }
}