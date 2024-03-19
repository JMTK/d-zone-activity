'use strict';
import Geometry from './../../common/geometry';
import util from './../../common/util';
import Pathfinder from './../pathfinder';
import type Actor from '../actor';
export default class GoTo {
    actor: Actor;
    target: any;
    destination: any;
    attempt: number;
    path: any;

    constructor(actor, target) {
        this.actor = actor;
        this.target = target;
        this.attempt = util.randomIntRange(1, 4);
        this.target.on('movecomplete', this.resetAttempt.bind(this)); // Reset adjacent attempts if target moves
        if (this.actor.destination) {
            this.actor.once('movecomplete', this.startGoTo.bind(this));
        } else {
            this.startGoTo();
        }
    }

    startGoTo() {
        if (!this.actor || this.actor.presence != 'online' || this.actor.underneath()) return;
        var adjacent = Geometry.closestGrids[this.attempt]!; // Pick grid next to target
        var targetDistance = Geometry.getDistance(this.actor.position, this.target.position);
        if (targetDistance <= Math.abs(adjacent[0]!) + Math.abs(adjacent[1]!)) {
            this.actor.stopGoTo(this);
            return;
        }
        this.destination = {
            x: this.target.position.x + adjacent[0], y: this.target.position.y + adjacent[1]
        };
        var destDelta = {
            x: this.destination.x - this.actor.position.x,
            y: this.destination.y - this.actor.position.y
        };
        var moveDir = {
            x: Math.abs(destDelta.x) > Math.abs(destDelta.y) ? Math.max(-1, Math.min(1, destDelta.x)) : 0,
            y: Math.abs(destDelta.y) >= Math.abs(destDelta.x) ? Math.max(-1, Math.min(1, destDelta.y)) : 0
        };
        var moveAttempt = this.actor.tryMove(moveDir.x, moveDir.y);
        if (moveAttempt) { // Try to move in the general direction of our target
            this.actor.destination = moveAttempt;
            this.actor.startMove();
            this.actor.once('movecomplete', this.startGoTo.bind(this));
        } else { // If moving toward target is blocked, find a path
            this.path = Pathfinder.findPath({ start: this.actor.position, end: this.destination });
            if (this.path[0]) { // If there is a path
                //this.attempt = util.randomIntRange(1,4); // Reset adjacent attempts
                this.actor.destination = { x: this.path[0].x, y: this.path[0].y, z: this.path[0].z };
                this.actor.startMove();
                this.actor.once('movecomplete', this.startGoTo.bind(this));
            } else { // If no path, try next closest tile
                this.attempt++;
                this.startGoTo();
            }
        }
    };

    resetAttempt() {
        this.attempt = util.randomIntRange(1, 4);
    };

    detach() { // Detach behavior from actor
        if (this.actor) this.actor.removeListener('movecomplete', this.startGoTo);
        if (this.target) this.target.removeListener('movecomplete', this.resetAttempt);
    };
}