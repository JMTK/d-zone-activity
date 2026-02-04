import util from './../common/util';
import WorldObject from './../engine/worldobject';

export default class Slab extends WorldObject {
    style: string;
    invisible: boolean;
    constructor(style: string, x: number, y: number, z: number) {
        super({
            position: {
                x: x,
                y: y,
                z: z
            },
            pixelSize: {
                x: 16,
                y: 16,
                z: 1
            },
            height: 0.5
        });
        this.invisible = true;
        this.style = style;
    }
}