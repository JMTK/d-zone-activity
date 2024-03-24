'use strict';
import Geometry from './../../common/geometry';
import util from './../../common/util';
import type Actor from './../../actors/actor';
export default class Wander {
    actor: Actor;
    state: string;
    impulseCompleteBound: any;
    impulseBound: any;
    impulseInterval: number;

    constructor(actor) {
        this.actor = actor;
        this.state = 'idle';
        this.impulseInterval = 300;
        this.impulseBound = this.impulse.bind(this);
        this.impulseCompleteBound = this.impulseComplete.bind(this);
        this.wait();
    }

    wait() {
        if (!this.actor) return;
        this.actor.tickDelay(this.impulseBound, 20 + Math.round(Math.random() * this.impulseInterval));
    }

    impulse() {
        if (!this.actor || this.actor.presence != 'online') return;
        if (this.actor.destination) { // Busy
            this.wait();
        }
        else {
            const direction = util.pickInObject(Geometry.DIRECTIONS);
            //direction = util.pickInArray(['east','south']);
            const moveXY = Geometry.DIRECTIONS[direction];
            const canMove = this.actor.tryMove(moveXY.x, moveXY.y);
            if (canMove) {
                this.actor.destination = canMove;
                this.actor.startMove();
                this.actor.once('movecomplete', this.impulseCompleteBound);
            }
            else {
                this.wait();
            }
        }
    }

    impulseComplete() {
        this.wait();
    }

    detach() { // Detach behavior from actor
        this.actor.removeListener('movecomplete', this.impulseCompleteBound);
        this.actor.removeFromSchedule(this.impulseBound);
    }
}