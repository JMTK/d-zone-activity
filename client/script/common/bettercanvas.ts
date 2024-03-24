'use strict';

function isNumeric(n: any): n is number {
    return typeof n === 'number'; //!isNaN(parseFloat(n)) && isFinite(n);
}

export default class BetterCanvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        if (!isNumeric(width) || !isNumeric(height)) console.error('bad canvas size!', width, height);
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d')!;
    }

    drawImage(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, dx?: number, dy?: number, dw?: number, dh?: number, opacity?: number) {
        if (!img || !(sx >= 0) || !(sy >= 0) || !(sw >= 0) || !(sh >= 0)
            || !isNumeric(dx) || !isNumeric(dy) || !(dw! >= 0) || !(dh! >= 0)) {
            console.error('bad drawImage params!', ...arguments);
        }
        if (opacity) {
            this.context.save();
            this.context.globalAlpha = opacity;
        }
        if (typeof dx === 'undefined') {
            this.context.drawImage(img, sx, sy, sw, sh);
        }
        else {
            this.context.drawImage(img, sx, sy, sw, sh, dx, dy!, dw!, dh!);
        }
        if (opacity) {
            this.context.restore();
        }
    }

    fill(color: string) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    fillRect(color: string, x: number, y: number, w: number, h: number) {
        if (!isNumeric(x) || !isNumeric(y) || !isNumeric(w) || !isNumeric(h)) {
            console.error('bad fillRect params!', ...arguments);
        }
        this.context.fillStyle = color;
        this.context.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    clearRect(x: number, y: number, w: number, h: number) {
        if (!isNumeric(x) || !isNumeric(y) || !isNumeric(w) || !isNumeric(h)) {
            console.error('bad clearRect params!', ...arguments);
        }
        this.context.clearRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
}
