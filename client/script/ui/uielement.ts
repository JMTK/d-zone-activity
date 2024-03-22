'use strict';
import { EventEmitter } from 'events';
import BetterCanvas from '../common/bettercanvas';
import util from '../common/util';
import type UI from './ui';


export interface UIElementOptions { ui: UI, parent: any, w?: number, h?: number, top?: number | 'auto', bottom?: number | 'auto', left?: number | 'auto', right?: number | 'auto' }
export default class UIElement extends EventEmitter {
    ui: UI;
    parent: any;
    elements: any[];
    w: number;
    h: number;
    x: number;
    y: number;
    autosize: boolean;
    top: number | 'auto';
    bottom: number | 'auto';
    left: number | 'auto';
    right: number | 'auto';
    canvas: BetterCanvas;
    constructor(options : UIElementOptions) {
        super();
        this.ui = options.ui;
        this.parent = options.parent;
        this.elements = [];
        this.w = 1; this.h = 1;
        if (options.w) this.w = options.w; else this.autosize = true;
        if (options.h) this.h = options.h; else this.autosize = true;
        if (options.top) this.top = options.top;
        if (options.bottom) this.bottom = options.bottom;
        if (options.left) this.left = options.left;
        if (options.right) this.right = options.right;
        this.canvas = new BetterCanvas(this.w || 1, this.h || 1);
        this.reposition();
    }

    reposition() {
        if (this.hasOwnProperty('top')) {
            if (this.top == 'auto') {
                this.y = Math.round(this.parent.y + this.parent.h / 2 - this.h / 2);
            } else {
                this.y = this.parent.y + this.top;
            }
        }
        if (this.hasOwnProperty('bottom')) this.y = this.parent.y + this.parent.h - this.h - (this.bottom as number);
        if (this.hasOwnProperty('left')) {
            if (this.left == 'auto') {
                this.x = Math.round(this.parent.x + this.parent.w / 2 - this.w / 2);
            } else {
                this.x = this.parent.x + this.left;
            }
        }
        if (this.hasOwnProperty('right')) this.x = this.parent.x + this.parent.w - this.w - (this.right as number);
        if (this.elements) {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].reposition();
            }
        }
    };

    redraw(canvas) {
        canvas.drawImage(this.canvas.canvas || this.canvas, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    };

    remove() {
        this.removeAllListeners('redraw');
        this.removeAllListeners('mouse-on-element');
        this.removeAllListeners('mouse-off-element');
        util.findAndRemove(this, this.ui.elements);
        if (this.elements) {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].remove();
            }
        }
        this.ui.redraw();
    };

    resize(width, height) {
        this.w = this.canvas.canvas.width = width;
        this.h = this.canvas.canvas.height = height;
        //this.draw?.();
    };

    resizeChildren(width, height) {
        if (this.elements) {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].resize(width, height);
            }
        }
    };
}