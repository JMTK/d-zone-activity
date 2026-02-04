import { EventEmitter } from 'events';
import ColorUtil from './../common/colorutil';
import util from '../../script/common/util';
import type Game from './game';

export default class Renderer extends EventEmitter {
    canvases: any[];
    bgCanvas: any;
    zBuffer: any;
    zBufferKeys: any[];
    updateDrawn: boolean;
    overlay: any[];
    frames: number;
    game: Game;
    images: any;

    constructor(options) {
        super();
        this.game = options.game;
        this.images = options.images;
        this.updateDrawn = false;
        this.zBuffer = {};
        this.zBufferKeys = [];
        this.overlay = [];
        this.frames = 0;

        let lastRenderTime = 0;

        const self = this;
        this.game.on('render', function () {
            self.updateDrawn = false;
        });
        const draw = function () {
            if (self.updateDrawn === false) {
                if (self.canvases) {
                    const timeThis = self.game.timeRenders && (self.game.ticks & 511) === 0;
                    const renderStart = performance.now();

                    for (const canvas of self.canvases) {
                        canvas.draw();
                        if (self.bgCanvas) canvas.drawBG(self.bgCanvas);
                        //self.emit('draw', self.canvases[c]);
                        for (let z = 0; z < self.zBufferKeys.length; z++) {
                            const zBufferDepth = self.zBuffer[self.zBufferKeys[z]];
                            for (let zz = 0; zz < zBufferDepth.length; zz++) {
                                canvas.drawEntity(zBufferDepth[zz]);
                                //zBufferDepth[zz].emit('draw',self.canvases[c],self.zBufferKeys[z]);
                            }
                        }
                        for (let o = 0; o < self.overlay.length; o++) {
                            canvas.drawEntity(self.overlay[o]);
                        }
                        if (self.game.ui) self.game.ui.emit('draw', canvas);
                    }
                    if (timeThis) {
                        const thisRenderTime = performance.now() - renderStart;
                        if (thisRenderTime > 1) {
                            const renderTimeChange = thisRenderTime - lastRenderTime;
                            if (renderTimeChange <= 0) console.log(`%c${renderTimeChange}`, 'color: #00bb00');
                            else if (renderTimeChange > 0) console.log(`%c${renderTimeChange}`, 'color: #ff0000');
                            lastRenderTime = thisRenderTime;
                        }
                    }
                }
                //self.frames++;
                //if((self.game.ticks & 63) == 0) {
                //    console.log(self.frames * 60 / 64);
                //    self.frames = 0;
                //}
                self.updateDrawn = true;
            }
            requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
    }

    addCanvas(canvas) {
        canvas.setRenderer(this);
        if (!this.canvases) this.canvases = [];
        this.canvases.push(canvas);
    }

    addToZBuffer(sprite, newZDepth) {
        const zBufferDepth = this.zBuffer[newZDepth];
        if (zBufferDepth) {
            zBufferDepth.push(sprite);
            zBufferDepth.sort(function (a, b) {
                return (a.position.z + a.position.fakeZ) - (b.position.z + b.position.fakeZ);
            });
        }
        else {
            this.zBuffer[newZDepth] = [sprite];
        }
        this.zBufferKeys = Object.keys(this.zBuffer);
        this.zBufferKeys.sort(function (a, b) {
            return a - b;
        });
    }

    updateZBuffer(oldZDepth, obj, newZDepth) {
        this.removeFromZBuffer(obj, oldZDepth);
        this.addToZBuffer(obj, newZDepth);
    }

    removeFromZBuffer(obj, zDepth) {
        const zBufferDepth = this.zBuffer[zDepth];
        util.findAndRemove(obj, zBufferDepth);
    }

    addColorSheet(options) {
        if (!this.images[options.color]) this.images[options.color] = {};
        if (this.images[options.color][options.sheet]) return;
        options.image = this.images[options.sheet];
        this.images[options.color][options.sheet] = ColorUtil.colorize(options);
    }

    clear() {
        this.zBuffer = {};
        this.zBufferKeys = [];
        this.overlay = [];
    }
}