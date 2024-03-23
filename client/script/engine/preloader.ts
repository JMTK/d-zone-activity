'use strict';
import BetterCanvas from './../common/bettercanvas';
import { EventEmitter } from 'events';
var imageList = ['actors', 'environment', 'static-tiles', 'props', 'font'];

export default class Preloader extends EventEmitter {
    images: Record<string, HTMLCanvasElement>;
    imagesLoaded: number;
    constructor() {
        super();
        this.images = {};
        this.imagesLoaded = 0;
    }

    async load() {
        return await Promise.all(imageList.map(imageName => {
            return new Promise(resolve => {
                var fileName = imageName + '.png';
                var image = new globalThis.Image();
                image.addEventListener('load', () => resolve(image));
                image.src = './img/' + fileName;
            }).then((image : HTMLImageElement) => {
                var canvas = new BetterCanvas(image.width, image.height);
                this.images[imageName] = canvas.canvas;
                canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height, 1);

                return image;
            });
        }));
    }
}