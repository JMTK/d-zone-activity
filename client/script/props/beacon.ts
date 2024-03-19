'use strict';
import WorldObject from '../engine/worldobject';
import BetterCanvas from './../common/bettercanvas';
import Sheet from './sheet';
import type Game from '../engine/game';
export default class Beacon extends WorldObject {
    game: Game;
    sheet: Sheet;
    imageName: string;
    sprite: any;
    exists: boolean = true;
    pinging: number;
    pingTimer: number = 0;
    pingDelay: number = 1000;
    pingCount: number = 0;
    pingMax: number = 10;
    pingTotal: number = 0;
    pingAverage: number = 0;
    pingTimeout: any;
    pingTimeoutDelay: number = 1000;
    unWalkable: boolean;
    constructor(x : number, y : number, z : number) {
        super({
            position: { x: x, y: y, z: z },
            pixelSize: { x: 15, y: 16, z: 45 },
            height: 2.5
        });
        //console.log('beacon:',this.position);
        this.unWalkable = true;
        var self = this;
        this.on('draw', function (canvas) {
            if (self.exists) canvas.drawEntity(self);
        });
        this.imageName = 'props';
        this.sheet = new Sheet('beacon');
        this.sprite.metrics = this.sheet.map.main;
    }

    addToGame(game) {
        super.addToGame(game);
        this.game.on('update', this.onUpdate.bind(this));
        this.drawSprite();
    };

    drawSprite() {
        var canvas = new BetterCanvas(this.sheet.map.main.w, this.sheet.map.main.h);
        canvas.drawImage(this.game.renderer.images[this.imageName],
            this.sheet.map.main.x, this.sheet.map.main.y, this.sheet.map.main.w, this.sheet.map.main.h,
            0, 0, this.sheet.map.main.w, this.sheet.map.main.h, 1);
        if (this.pinging) {
            canvas.drawImage(this.game.renderer.images[this.imageName],
                this.sheet.map.light.x, this.sheet.map.light.y, this.sheet.map.light.w, this.sheet.map.light.h,
                this.sheet.map.light.ox, 0, this.sheet.map.light.w, this.sheet.map.light.h, this.pinging / 100);
        }
        this.sprite.image = canvas.canvas;
    };

    onUpdate() {
        if (this.pinging) {
            this.pinging = Math.max(0, this.pinging - 1);
            this.drawSprite();
        }
    };

    ping() {
        this.pinging = 100;
    };
}