'use strict';
import util from './../common/util';
import WorldObject from './../engine/worldobject';

export default class Slab extends WorldObject {
    style: string;
    invisible: boolean;
    constructor(style: string, x: number, y: number, z: number) {
        super({
            position: { x, y, z },
            pixelSize: { x: 0, y: 0, z: 0 },
            height: 0.5
        });
        this.invisible = true;
        WorldObject.call(this, { position: { x: x, y: y, z: z }, pixelSize: { x: 16, y: 16, z: 1 }, height: 0.5 });
        this.style = style;
    }
}