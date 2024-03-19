'use strict';
import { EventEmitter } from 'events';
import ColorUtil from './../common/colorutil';

export default class Renderer extends EventEmitter {
    canvases: any[];
    bgCanvas: any;
    zBuffer: any;
    zBufferKeys: any[];
    updateDrawn: boolean;
    overlay: any[];
    frames: number;
    game: any;
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

        var lastRenderTime = 0;

        var self = this;
        this.game.on('render', function () {
            self.updateDrawn = false;
        });
        var draw = function () {
            if (self.updateDrawn == false) {
                if (self.canvases) {
                    var timeThis = self.game.timeRenders && (self.game.ticks & 511) == 0;
                    if (timeThis) console.time('render');
                    //if(timeThis) console.log(self.zBuffer);
                    //if(timeThis) var renderStart = performance.now();
                    for (var c = 0; c < self.canvases.length; c++) {
                        var canvas = self.canvases[c];
                        canvas.draw();
                        if (self.bgCanvas) canvas.drawBG(self.bgCanvas);
                        //self.emit('draw', self.canvases[c]);
                        for (var z = 0; z < self.zBufferKeys.length; z++) {
                            var zBufferDepth = self.zBuffer[self.zBufferKeys[z]];
                            for (var zz = 0; zz < zBufferDepth.length; zz++) {
                                canvas.drawEntity(zBufferDepth[zz]);
                                //zBufferDepth[zz].emit('draw',self.canvases[c],self.zBufferKeys[z]);
                            }
                        }
                        for (var o = 0; o < self.overlay.length; o++) {
                            canvas.drawEntity(self.overlay[o]);
                        }
                        if (self.game.ui) self.game.ui.emit('draw', canvas);
                    }
                    if (timeThis) console.timeEnd('render');
                    //if(timeThis) var thisRenderTime = performance.now() - renderStart;
                    //if(timeThis) var renderTimeChange = thisRenderTime-lastRenderTime;
                    //if(timeThis && renderTimeChange <= 0) console.log('%c'+renderTimeChange, 'color: #00bb00');
                    //if(timeThis && renderTimeChange > 0) console.log('%c'+renderTimeChange, 'color: #ff0000');
                    //if(timeThis) lastRenderTime = thisRenderTime;
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
    };

    addToZBuffer(sprite, newZDepth) {
        var zBufferDepth = this.zBuffer[newZDepth];
        if (zBufferDepth) {
            zBufferDepth.push(sprite);
            zBufferDepth.sort(function (a, b) {
                return (a.position.z + a.position.fakeZ) - (b.position.z + b.position.fakeZ);
            });
        } else {
            this.zBuffer[newZDepth] = [sprite];
        }
        this.zBufferKeys = Object.keys(this.zBuffer);
        this.zBufferKeys.sort(function (a, b) { return a - b; });
    };

    updateZBuffer(oldZDepth, obj, newZDepth) {
        this.removeFromZBuffer(obj, oldZDepth);
        this.addToZBuffer(obj, newZDepth);
    };

    removeFromZBuffer(obj, zDepth) {
        var zBufferDepth = this.zBuffer[zDepth];
        for (var i = 0; i < zBufferDepth.length; i++) {
            if (zBufferDepth[i] === obj) {
                zBufferDepth.splice(i, 1);
                break;
            }
        }
    };

    addColorSheet(options) {
        if (!this.images[options.color]) this.images[options.color] = {};
        if (this.images[options.color][options.sheet]) return;
        options.image = this.images[options.sheet];
        this.images[options.color][options.sheet] = ColorUtil.colorize(options);
    };

    clear() {
        this.zBuffer = {};
        this.zBufferKeys = [];
        this.overlay = [];
    };
}