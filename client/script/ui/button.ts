'use strict';
import UIElement from './uielement';
import TextBlotter from '../common/textblotter';

export default class Button extends UIElement {
    text: string;
    textCanvas: any;
    disabled: boolean;
    onPress: any;
    mouseOn: boolean;
    pressed: boolean;
    autosize: boolean;

    constructor(options) {
        super(options);
        if (options.text) this.changeText(options.text);
        if (options.onPress) this.onPress = options.onPress;
        if (options.disabled) this.disabled = true;
        this.on('mouse-on', this.onMouseOn.bind(this));
        this.on('mouse-off', this.onMouseOff.bind(this));
        this.on('mouse-down', this.onMouseDown.bind(this));
        this.on('mouse-up', this.onMouseUp.bind(this));
    }

    changeText(text) {
        this.text = text;
        this.textCanvas = TextBlotter.blot({ text: this.text });
        if (this.autosize) {
            this.w = this.canvas.canvas.width = this.textCanvas.width + 2;
            this.h = this.canvas.canvas.height = this.textCanvas.height + 2;
        }
        this.draw();
    }

    draw() {
        this.canvas.clear();
        this.canvas.fillRect('rgba(255,255,255,0.8)', 0, 0, this.w, this.h);
        this.canvas.clearRect(1, 1, this.w - 2, this.h - 2);
        const buttonColor = `rgba(${this.mouseOn ? '77,102,184,0.9)' : this.disabled ? '245,240,213,0.3)' : '0,0,0,0.8)'}`;
        this.canvas.fillRect(buttonColor, 1, 1, this.w - 2, this.h - 2);
        const textOffset = Math.floor((this.canvas.canvas.width - this.textCanvas.width) / 2);
        this.canvas.drawImage(this.textCanvas, 0, 0, this.textCanvas.width, this.textCanvas.height,
            textOffset, 1, this.textCanvas.width, this.textCanvas.height, 1);
        this.emit('redraw');
    }

    onMouseOn(mouseEvent) {
        if (this.disabled || this.mouseOn) return;
        this.mouseOn = true;
        this.emit('mouse-on-element', this);
        this.draw();
    }

    onMouseOff(mouseEvent) {
        if (this.disabled || !this.mouseOn) return;
        this.mouseOn = false;
        this.pressed = false;
        this.emit('mouse-off-element', this);
        this.draw();
    }

    onMouseDown(mouseEvent) {
        if (this.disabled || !this.mouseOn) return;
        this.pressed = true;
        this.draw();
    }

    onMouseUp(mouseEvent) {
        if (this.disabled || !this.mouseOn) return;
        this.pressed = false;
        if (this.onPress) this.onPress();
        this.draw();
    }
}