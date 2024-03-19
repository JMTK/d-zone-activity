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
        for (var i = 0; i < imageList.length; i++) {
            var imageName = imageList[i];
            var fileName = imageName + '.png';
            var image = new Image;
            image.addEventListener('load', this.onImageLoad.bind(this, image, imageName));
            image.src = './img/' + fileName;
        }
    }

    onImageLoad(image, imageName) {
        var canvas = new BetterCanvas(image.width, image.height);
        this.images[imageName] = canvas.canvas;
        canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height, 1);
        this.imagesLoaded++;
        if (this.imagesLoaded == imageList.length) this.emit('complete', this.images);
    };
}