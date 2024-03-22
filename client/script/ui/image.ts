'use strict';
import UIElement, { UIElementOptions } from './uielement'
import TextBlotter from '../common/textblotter'

export interface ImageOptions extends UIElementOptions {
    url: string,
    hyperlink?: string,
    maxWidth?: number,
    onPress?: any,
    autosize?: boolean
}
export default class Image extends UIElement {
    url: string;
    hyperlink: string;
    maxWidth: number;
    onPress: any;
    mouseOn: boolean;
    pressed: boolean;
    constructor(options: ImageOptions) {
        super(options);
        if (options.onPress) this.onPress = options.onPress;
        if (options.hyperlink) this.hyperlink = options.hyperlink;
        if (options.maxWidth) this.maxWidth = options.maxWidth;
        if (options.url) this.changeImage(options.url);
        this.on('mouse-on', this.onMouseOn.bind(this));
        this.on('mouse-off', this.onMouseOff.bind(this));
        this.on('mouse-down', this.onMouseDown.bind(this));
        this.on('mouse-up', this.onMouseUp.bind(this));
    }

    changeImage(url : string) {
        this.url = url;
        const imageElement = new globalThis.Image();
        imageElement.src = this.url;
        this.canvas.drawImage(imageElement, 0, 0, this.options.w!, this.options.h!, this.options.left as number, this.options.top as number, this.options.w!, this.options.h!, 1);
        this.reposition();
        this.draw();
    };

    draw() {
        this.canvas.clear();
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