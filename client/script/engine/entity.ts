'use strict';
import EventEmitter from 'events';
import util from '../common/util';
import type Game from '../engine/game';
export default class Entity extends EventEmitter {
    exists: boolean = false;
    game: Game;
    sprite: any;
    zDepth: number;
    invisible: boolean;

    constructor() {
        super();
        this.sprite = {};
    }

    addToGame(game) {
        this.game = game;
        this.game.entities.push(this);
        if (this.hasOwnProperty('position')) {
            this.game.world.addToWorld(this);
            if (!this.invisible) this.game.renderer.addToZBuffer(this.sprite, this.zDepth);
        } else {
            this.game.renderer.overlay.push(this.sprite);
        }
        this.exists = true;
    };

    remove() {
        this.exists = false;
        if (this.hasOwnProperty('position')) {
            if (!this.invisible) this.game.renderer.removeFromZBuffer(this.sprite, this.zDepth);
            this.game.world.removeFromWorld(this);
        } else {
            util.findAndRemove(this, this.game.renderer.overlay);
        }
        util.findAndRemove(this, this.game.entities);
    };

    tickDelay(cb : Function, ticks: number) { // Execute callback after X ticks
        this.game.schedule.push({ type: 'once', tick: this.game.ticks + ticks, cb: cb, entity: this });
    };

    tickRepeat(cb: Function, ticks : number, afterCB?: Function) { // Execute callback every tick for X ticks
        this.game.schedule.push({ type: 'repeat', start: this.game.ticks, count: ticks, cb: cb, afterCB: afterCB, entity: this });
    };

    removeFromSchedule(cb : Function) {
        for (var i = 0; i < this.game.schedule.length; i++) {
            if (this.game.schedule[i].entity === this && this.game.schedule[i].cb === cb) {
                this.game.schedule[i].type = 'deleted';
                break;
            }
        }
    };
}