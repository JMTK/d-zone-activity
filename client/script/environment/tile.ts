'use strict';
import type Game from 'script/engine/game';
import util from './../common/util';
import Sheet from './sheet2';

export default class Tile {
    game: Game;
    grid: any;
    tileCode: string;
    position: any;
    zDepth: number;
    screen: any;
    imageName: string;
    sheet: any;
    sprite: any;
    constructor(options: {
        game: Game,
        grid: any,
        tileCode: string,
        position: any
    }) {
        this.game = options.game;
        this.grid = options.grid;
        this.tileCode = options.tileCode;
        this.position = options.position;
        this.zDepth = this.position.x + this.position.y;
        this.screen = {
            x: (this.position.x - this.position.y) * 16 - 16,
            y: (this.position.x + this.position.y) * 8 - (this.position.z) * 16 - 8
        };
        this.game.level ??= 'plain';
        this.imageName = `static-tiles-${this.game.level}`;
        this.sheet = new Sheet('tile');

        const spriteMap = this.sheet.map[this.tileCode];
        this.sprite = {
            metrics: {
                x: spriteMap.x,
                y: spriteMap.y,
                w: spriteMap.w,
                h: spriteMap.h,
                ox: spriteMap.ox,
                oy: spriteMap.oy
            },
            image: this.imageName,
            position: this.position,
            screen: this.screen
        };
        if (this.tileCode == 'G-G-G-G') {
            let variation = util.randomIntRange(0, 2);
            const random = Math.random();
            if (Math.random() > 0.98) variation = 8;
            else if (Math.random() > 0.95) variation = util.randomIntRange(5, 7);
            else if (random > 0.6) variation = util.randomIntRange(3, 4);
            this.sprite.metrics.x += variation * this.sprite.metrics.w;
        }
    }
}