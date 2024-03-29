'use strict';
import util from './../common/util';
import WorldObject from './../engine/worldobject';
import BetterCanvas from './../common/bettercanvas';
import Sheet from './sheet';

export default class Seed extends WorldObject {
    sheet: Sheet;
    growTime: number;
    growStage: number;
    growthStage: number;
    origin: any;
    boundGrow: any;
    boundWither: any;
    unwalkable: boolean;

    constructor(options) {
        super({
            position: {
                x: options.destination.x,
                y: options.destination.y,
                z: options.destination.z
            },
            pixelSize: {
                x: 12,
                y: 12,
                z: 16
            },
            height: 1
        });
        this.unwalkable = true;
        this.origin = options.origin;
        //var canvas = new BetterCanvas(1,1);
        const self = this;
        this.on('draw', function (canvas) {
            if (self.exists) canvas.drawEntity(self);
        });
        this.sheet = new Sheet('seed');
        this.sprite.image = 'props';
        this.sprite.metrics = this.sheet.map.plant;
        this.boundGrow = this.grow.bind(this);
        this.boundWither = this.wither.bind(this);
        this.growTime = 80;
        this.growStage = 0;
    }

    addToGame(game) {
        super.addToGame(game);
        this.tickDelay(this.boundGrow, this.growTime + util.randomIntRange(this.growTime / -6, this.growTime / 6));
    }

    grow() {
        this.growStage++;
        const metrics = JSON.parse(JSON.stringify(this.sheet.map.plant));
        metrics.x += this.sprite.metrics.w * this.growStage;
        this.sprite.metrics = metrics;
        const nextGrowth = this.growTime + util.randomIntRange(this.growTime / -6, this.growTime / 6);
        if (this.growStage < 5) {
            this.tickDelay(this.boundGrow, nextGrowth);
        }
        else {
            this.tickDelay(this.boundWither, Math.floor(nextGrowth / 2));
        }
    }

    wither() {
        const metrics = this.sheet.map.orb;
        this.sprite.metrics = JSON.parse(JSON.stringify(metrics));
        this.tickRepeat((progress) => {
            this.sprite.metrics.oy = Math.round(metrics.oy + progress.ticks / 2);
            if (progress.percent >= 1) this.growthStage = 6;
        }, 26, () => { });
    }

    //onUpdate() {
    //if(this.position.z > 0) {
    //    this.velocity.z = Math.max(-0.02,this.velocity.z-0.0001);
    //    this.velocity.x = util.clamp(this.velocity.x + util.randomIntRange(-1,1)/1000,-0.01,0.01);
    //    this.velocity.y = util.clamp(this.velocity.y + util.randomIntRange(-1,1)/1000,-0.01,0.01);
    //    this.position.x += this.velocity.x;
    //    this.position.y += this.velocity.y;
    //    this.position.z = Math.max(0,this.position.z + this.velocity.z);
    //    this.zDepth = this.calcZDepth();
    //    this.updateScreen();
    //} else {
    //    this.velocity.z = 0; this.velocity.x = 0; this.velocity.y = 0;
    //}
    //};

    //calcZDepth() {
    //    return Math.round(this.position.x) + Math.round(this.position.y);
    //};
}