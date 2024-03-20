'use strict';
import EventEmitter from 'events';
import Actor from './actor';
import type Game from '../engine/game';
import type World from '../environment/world';

export default class Users extends EventEmitter {
    game: Game;
    world: World;
    actors: Record<string, Actor>;
    messageQueue: Record<string, any>;
    constructor(game : Game, world : World) {
        super();
        this.setMaxListeners(0);
        this.game = game;
        this.game.once('destroy', this.destroy.bind(this));
        this.game.users = this;
        this.world = world;
        this.actors = {};
        this.messageQueue = {};
    }
    addActor(data : { uid: string, username: string, status: string, roleColor?: string }) {
        var grid = this.world.randomEmptyGrid();
        var actor = new Actor({
            x: +grid.split(':')[0], y: +grid.split(':')[1], z: 0,
            uid: data.uid,
            username: data.username,
            roleColor: data.roleColor,
            maxListeners: this.getMaxListeners() + 3
        });
        this.actors[actor.uid] = actor;
        actor.addToGame(this.game);
        actor.updatePresence(data.status);
    };

    updateActor(data : { uid: string, delete: boolean, status: string, username: string }) {
        let actor = this.actors[data.uid]
        if (actor) {
            if (data.delete) {
                actor.updatePresence('offline')
                this.removeActor(actor)
            } else {
                actor.updatePresence(data.status)
            }
        } else {
            this.addActor(data);
        }
    }

    removeActor(actor : Actor) {
        delete this.actors[actor.uid];
        actor.remove();
    };

    queueMessage(data: { uid: string, message: string, channel: string }) {
        console.log("Queueing message", data);
        if (!data.message || !this.actors[data.uid]) return;
        if (!this.messageQueue[data.channel]) this.messageQueue[data.channel] = { busy: false, messages: [] };
        this.messageQueue[data.channel].messages.push({
            uid: data.uid,
            message: data.message
        });
        this.onMessageAdded(data.channel);
    };

    onMessageAdded(channel : string) {
        if (this.messageQueue[channel].busy || this.messageQueue[channel].messages.length < 1) return;
        this.messageQueue[channel].busy = true;
        var message = this.messageQueue[channel].messages[0];
        var self = this;
        this.actors[message.uid]!.startTalking(message.message, channel, function () {
            self.messageQueue[channel].messages.shift();
            self.messageQueue[channel].busy = false;
            self.onMessageAdded(channel);
        });
        this.emit('message', { user: this.actors[message.uid], channel: channel });
    };

    getActorAtPosition(x, y, z) { // For debugging
        for (var aKey in this.actors) {
            if (!this.actors.hasOwnProperty(aKey)) continue;
            if (this.actors[aKey]!.position.x == x
                && this.actors[aKey]!.position.y == y
                && this.actors[aKey]!.position.z == z) return this.actors[aKey];
        }
    };

    destroy() {
        this.actors = {};
        this.messageQueue = {};
    };
}
