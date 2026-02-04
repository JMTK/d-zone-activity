import { EventEmitter } from 'events';
import BetterCanvas from '../common/bettercanvas';
import TextBlotter from '../common/textblotter';
import Button from './button';
import Panel from './panel';
import Input from './input';
import type { LabelOptions } from './label';
import Label from './label';
import type { ImageOptions } from './image';
// eslint-disable-next-line no-redeclare
import Image from './image';
import type Game from '../engine/game';
import type UIElement from './uielement';

export default class UI extends EventEmitter {
    game: Game;
    elements: UIElement[];
    x: number;
    y: number;
    w: number;
    h: number;
    canvas: BetterCanvas;
    mouseOnElement: HTMLElement | null;

    constructor(game: Game) {
        super();
        this.game = game;
        TextBlotter.loadImage(this.game.renderer.images.font);
        this.game
            .on('resize', this.onResize.bind(this))
            .on('mousemove', this.onMouseMove.bind(this))
            .on('mousedown', this.onMouseDown.bind(this))
            .on('mouseup', this.onMouseUp.bind(this))
            .on('keydown', this.onKeyDown.bind(this))
            .on('keyup', this.onKeyUp.bind(this));
        this.elements = [];
        this.x = 0; this.y = 0;
        this.canvas = new BetterCanvas(1, 1);
        const self = this;
        this.on('draw', function (canvas) {
            canvas.drawStatic(self.canvas.canvas);
        });
    }

    // TODO: Abstract these different add methods into one
    addButton(options) {
        if (!options.parent) options.parent = this;
        options.ui = this;
        const newButton = new Button(options);
        options.parent.elements.push(newButton);
        if (options.parent !== this) this.elements.push(newButton);
        newButton.on('redraw', this.redraw.bind(this));
        newButton.on('mouse-on-element', this.onMouseOnElement.bind(this));
        newButton.on('mouse-off-element', this.onMouseOffElement.bind(this));
        return newButton;
    }

    addPanel(options) {
        if (!options.parent) options.parent = this;
        options.ui = this;
        const newPanel = new Panel(options);
        options.parent.elements.push(newPanel);
        if (options.parent !== this) this.elements.push(newPanel);
        newPanel.on('redraw', this.redraw.bind(this));
        return newPanel;
    }

    addInput(options) {
        if (!options.parent) options.parent = this;
        options.ui = this;
        const newInput = new Input(options);
        options.parent.elements.push(newInput);
        if (options.parent !== this) this.elements.push(newInput);
        newInput.on('redraw', this.redraw.bind(this));
        newInput.on('mouse-on-element', this.onMouseOnElement.bind(this));
        newInput.on('mouse-off-element', this.onMouseOffElement.bind(this));
        return newInput;
    }

    addImage(options: { parent?: any } & Omit<ImageOptions, 'ui'>) {
        if (!options.parent) options.parent = this;
        const newImage = new Image({
            ...options,
            ui: this
        });
        options.parent.elements.push(newImage);
        if (options.parent !== this) this.elements.push(newImage);
        newImage.on('redraw', this.redraw.bind(this));
        newImage.on('mouse-on-element', this.onMouseOnElement.bind(this));
        newImage.on('mouse-off-element', this.onMouseOffElement.bind(this));
        return newImage;
    }

    addLabel(options: { parent?: any } & Omit<LabelOptions, 'ui'>) {
        if (!options.parent) options.parent = this;
        const newLabel = new Label({
            ...options,
            ui: this
        });
        options.parent.elements.push(newLabel);
        if (options.parent !== this) this.elements.push(newLabel);
        newLabel.on('redraw', this.redraw.bind(this));
        newLabel.on('mouse-on-element', this.onMouseOnElement.bind(this));
        newLabel.on('mouse-off-element', this.onMouseOffElement.bind(this));
        return newLabel;
    }

    redraw() {
        this.canvas.clear();
        for (const elem of this.elements) {
            elem.redraw(this.canvas);
        }
    }

    onMouseMove(mouseEvent) {
        if (this.game.mouseButtons.length > 0) return;
        for (const elem of this.elements) {
            if (mouseEvent.x >= elem.x && mouseEvent.x < elem.x + elem.w
                && mouseEvent.y >= elem.y && mouseEvent.y < elem.y + elem.h) {
                elem.emit('mouse-on', mouseEvent);
            }
            else {
                elem.emit('mouse-off', mouseEvent);
            }
        }
    }

    onMouseDown(mouseEvent) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i]!.emit('mouse-down', mouseEvent);
        }
    }

    onMouseUp(mouseEvent) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i]!.emit('mouse-up', mouseEvent);
        }
    }

    onKeyDown(keyEvent) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i]!.emit('key-down', keyEvent);
        }
    }

    onKeyUp(keyEvent) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i]!.emit('key-up', keyEvent);
        }
    }

    onMouseOnElement(elem) {
        this.mouseOnElement = elem;
        this.game.mouseOver = null;
    }

    onMouseOffElement(elem: HTMLElement) {
        this.mouseOnElement = this.mouseOnElement === elem ? null : this.mouseOnElement;
    }

    onResize(resize) {
        this.w = resize.width; this.h = resize.height;
        this.canvas.canvas.width = this.w;
        this.canvas.canvas.height = this.h;
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i]!.reposition();
        }
        this.redraw();
    }
}
