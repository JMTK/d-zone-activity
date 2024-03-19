'use strict';
import Entity from './entity';

export default class WorldObject extends Entity {
    height: number;
    zDepth: number;
    sprite: any;
    screen: any;
    position: any;
    pixelSize: any;
    game: any;

    constructor(options: {
        position: { x: number, y: number, z: number },
        height: number,
        pixelSize: { x: number, y: number, z: number }
    }) {
        super();
        this.position = {
            x: options.position.x,
            y: options.position.y,
            z: options.position.z,
            fakeZ: 0
        };
        this.height = options.height;
        this.zDepth = this.calcZDepth();
        this.pixelSize = {
            x: options.pixelSize.x,
            y: options.pixelSize.y,
            z: options.pixelSize.z
        };
        this.screen = {};
        this.updateScreen();
        this.sprite.screen = this.screen;
        this.sprite.position = this.position;
    }

    move(x, y, z) {
        var newX = this.position.x + x;
        var newY = this.position.y + y;
        var newZ = this.position.z + z;
        this.game.world.moveObject(this, newX, newY, newZ);
        this.updateScreen();
        var newZDepth = this.calcZDepth();
        if (newZDepth != this.zDepth) {
            this.game.renderer.updateZBuffer(this.zDepth, this.sprite, newZDepth);
            this.zDepth = newZDepth;
        }
    };

    underneath() {
        return this.game.world.objectAtXYZ(this.position.x, this.position.y, this.position.z + this.height);
    };

    calcZDepth() {
        return this.position.x + this.position.y;
    };

    updateScreen() {
        this.screen.x = (this.position.x - this.position.y) * 16 - this.pixelSize.x;
        this.screen.y = (this.position.x + this.position.y) * 8 - (this.position.z + this.height) * 16;
    };
}