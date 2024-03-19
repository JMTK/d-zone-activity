'use strict';
import UIElement from './uielement';
import TextBlotter from '../common/textblotter';
import util from '../common/util';

export default class Input extends UIElement {
    text: string;
    textCanvas: any;
    focused: boolean;
    onSubmit: any;
    autosize: boolean;
    mouseOn: boolean;

    constructor(options) {
        super(options);
        this.changeText(options.text || '');
        if (options.onSubmit) this.onSubmit = options.onSubmit;
        this.on('mouse-on', this.onMouseOn.bind(this));
        this.on('mouse-off', this.onMouseOff.bind(this));
        this.on('mouse-down', this.onMouseDown.bind(this));
        this.on('mouse-up', this.onMouseUp.bind(this));
        this.on('key-down', this.onKeyDown.bind(this));
    }

    changeText(text) {
        this.text = text;
        var showText = text + (this.focused ? '_' : '');
        this.textCanvas = TextBlotter.blot({ text: showText });
        if (this.autosize) {
            this.w = this.canvas.canvas.width = this.textCanvas.width + 2;
            this.h = this.canvas.canvas.height = this.textCanvas.height + 2;
        }
        this.draw();
    };

    draw() {
        this.canvas.clear();
        var borderColor = this.mouseOn ? 'rgba(220,220,220,0.8)' : 'rgba(255,255,255,0.8)';
        borderColor = this.focused ? 'rgba(115,138,215,0.8)' : borderColor;
        this.canvas.fillRect(borderColor, 0, 0, this.w, this.h);
        this.canvas.clearRect(1, 1, this.w - 2, this.h - 2);
        this.canvas.fillRect('rgba(0,0,0,0.8)', 1, 1, this.w - 2, this.h - 2);
        this.canvas.drawImage(this.textCanvas, 0, 0, this.textCanvas.width, this.textCanvas.height,
            1, 1, this.textCanvas.width, this.textCanvas.height, 1);
        this.emit('redraw');
    };

    focus(setTo? : boolean) {
        this.focused = setTo !== false;
        this.changeText(this.text);
    };

    submit() {
        this.onSubmit(this.text);
    };

    onMouseOn(mouseEvent) {
        if (this.mouseOn) return;
        this.mouseOn = true;
        this.emit('mouse-on-element', this);
        this.draw();
    };

    onMouseOff(mouseEvent) {
        if (!this.mouseOn) return;
        this.mouseOn = false;
        this.emit('mouse-off-element', this);
        this.draw();
    };

    onMouseDown(mouseEvent) {
        if (!this.mouseOn) this.focus(false);
    };

    onMouseUp(mouseEvent) {
        if (this.mouseOn) this.focus();
    };

    onKeyDown(keyEvent) {
        if (!this.focused) return;
        if (keyEvent.key == 'enter') this.submit();
        // TODO: Move this stuff into a typing event in engine/input.js
        var typed = keyEvent.key;
        if (keyEvent.key == 'backspace') {
            this.changeText(this.text.substring(0, Math.max(0, this.text.length - 1)));
        } else {
            if (keyEvent.key == 'period') typed = '.';
            if (keyEvent.key == 'dash') typed = '-';
            if (typed != '.' && typed != '-'
                && util.alphabet.indexOf(typed) < 0 && util.hex.indexOf(typed) < 0) return;
            this.changeText(this.text + (this.ui.game.input.keys.shift ? typed.toUpperCase() : typed));
        }
    };
}