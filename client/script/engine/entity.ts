import EventEmitter from 'events';
import util from '../common/util';
import type Game from '../engine/game';
export default class Entity extends EventEmitter {
    exists: boolean = false;
    game: Game;
    sprite: Record<any, any>;
    zDepth: number;
    invisible: boolean;

    constructor() {
        super();
        this.sprite = {};
    }

    addToGame(game) {
        this.game = game;
        this.game.entities.push(this);
        if ('position' in this) {
            this.game.world.addToWorld(this);
            if (!this.invisible) this.game.renderer.addToZBuffer(this.sprite, this.zDepth);
        }
        else {
            this.game.renderer.overlay.push(this.sprite);
        }
        this.exists = true;
    }

    remove() {
        this.exists = false;
        if ('position' in this) {
            if (!this.invisible) this.game.renderer.removeFromZBuffer(this.sprite, this.zDepth);
            this.game.world.removeFromWorld(this);
        }
        else {
            util.findAndRemove(this, this.game.renderer.overlay);
        }
        util.findAndRemove(this, this.game.entities);
    }

    tickDelay(cb: Function, ticks: number) { // Execute callback after X ticks
        this.game.schedule.push({
            type: 'once',
            tick: this.game.ticks + ticks,
            cb: cb,
            entity: this,
            start: undefined,
            count: undefined
        });
    }

    tickRepeat(cb: Function, ticks: number, afterCB?: Function) { // Execute callback every tick for X ticks
        this.game.schedule.push({
            type: 'repeat',
            start: this.game.ticks,
            count: ticks,
            cb: cb,
            afterCB: afterCB,
            entity: this,
            tick: 0
        });
    }

    removeFromSchedule(cb: Function) {
        for (let i = 0; i < this.game.schedule.length; i++) {
            const task = this.game.schedule[i]!;
            if (task.entity === this && task.cb === cb) {
                task.type = 'deleted';
                break;
            }
        }
    }
}