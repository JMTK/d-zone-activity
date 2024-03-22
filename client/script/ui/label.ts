'use strict';
import UIElement, { UIElementOptions } from './uielement'
import TextBlotter from '../common/textblotter'

export interface LabelOptions extends UIElementOptions {
    text: string,
    hyperlink?: string,
    maxWidth?: number,
    onPress?: any,
    autosize?: boolean
}
export default class Label extends UIElement {
    text: string;
    textCanvas: any;
    hyperlink: string;
    maxWidth: number;
    onPress: any;
    mouseOn: boolean;
    pressed: boolean;
    constructor(options: LabelOptions) {
        super(options);
        if (options.onPress) this.onPress = options.onPress;
        if (options.hyperlink) this.hyperlink = options.hyperlink;
        if (options.maxWidth) this.maxWidth = options.maxWidth;
        if (options.text) this.changeText(options.text);
        this.on('mouse-on', this.onMouseOn.bind(this));
        this.on('mouse-off', this.onMouseOff.bind(this));
        this.on('mouse-down', this.onMouseDown.bind(this));
        this.on('mouse-up', this.onMouseUp.bind(this));
    }

    changeText(text : string) {
        this.text = text;
        this.textCanvas = TextBlotter.blot({ text: this.text, maxWidth: this.maxWidth });
        if (this.autosize) {
            this.w = this.canvas.canvas.width = this.textCanvas.width;
            this.h = this.canvas.canvas.height = this.textCanvas.height;
        }
        this.reposition();
        this.draw();
    };

    draw() {
        this.canvas.clear();
        this.canvas.drawImage(this.textCanvas, 0, 0, this.textCanvas.width, this.textCanvas.height,
            0, 0, this.textCanvas.width, this.textCanvas.height, 1);
        this.emit('redraw');
    };

    onMouseOn(mouseEvent) {
        if (this.mouseOn) return;
        this.mouseOn = true;
        if (this.hyperlink) document.body.style.cursor = 'pointer';
        this.emit('mouse-on-element', this);
        this.draw();
    };

    onMouseOff(mouseEvent) {
        if (!this.mouseOn) return;
        this.mouseOn = false;
        if (this.hyperlink) document.body.style.cursor = 'default';
        this.pressed = false;
        this.emit('mouse-off-element', this);
        this.draw();
    };

    onMouseDown(mouseEvent) {
        if (!this.mouseOn) return;
        this.pressed = true;
        this.draw();
    };

    onMouseUp(mouseEvent) {
        if (!this.mouseOn) return;
        this.pressed = false;
        if (this.onPress) this.onPress();
        if (this.hyperlink) window.open(this.hyperlink);
        this.draw();
    };
}