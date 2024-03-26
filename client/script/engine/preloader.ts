'use strict';
import BetterCanvas from './../common/bettercanvas';
import { EventEmitter } from 'events';
const imageList = ['actors', 'environment', 'static-tiles-plain', 'static-tiles-beach', 'props', 'font'];

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
                const fileName = `${imageName}.png`;
                const image = new globalThis.Image();
                image.addEventListener('load', () => resolve(image));
                image.src = `./img/${fileName}`;
            }).then((image: HTMLImageElement) => {
                const canvas = new BetterCanvas(image.width, image.height);
                this.images[imageName] = canvas.canvas;
                canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height, 1);

                return image;
            });
        }));
    }
}