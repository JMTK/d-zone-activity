
function applyAlpha(source, target) {
    const sourceData = source.getContext('2d').getImageData(0, 0, source.width, source.height),
        targetCtx = target.getContext('2d'),
        targetData = targetCtx.getImageData(0, 0, target.width, target.height);
    for (let p = 3; p < targetData.data.length; p += 4) {
        targetData.data[p] = sourceData.data[p];
    }
    targetCtx.putImageData(targetData, 0, 0);
}

export default {
    colorize: function (options) {
        const canvas = document.createElement('canvas');
        canvas.width = options.image.width;
        canvas.height = options.image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(options.image, 0, 0, options.image.width, options.image.height,
            0, 0, options.image.width, options.image.height);
        context.globalCompositeOperation = 'color';
        const colorCanvas = document.createElement('canvas');
        colorCanvas.width = options.image.width;
        colorCanvas.height = options.image.height;
        const colorContext = colorCanvas.getContext('2d')!;
        colorContext.fillStyle = options.color;
        colorContext.globalAlpha = options.alpha;
        colorContext.fillRect(0, 0, options.image.width, options.image.height);
        if (options.regions) { // Paint custom regions if specified
            for (const reg of options.regions) {
                colorContext.clearRect(reg.x, reg.y, reg.w, reg.h);
                colorContext.fillStyle = reg.color ? reg.color : options.color;
                colorContext.globalAlpha = reg.alpha ? reg.alpha : options.alpha;
                colorContext.fillRect(reg.x, reg.y, reg.w, reg.h);
            }
        }
        context.drawImage(colorCanvas, 0, 0);
        applyAlpha(options.image, canvas); // Restore original alpha channel
        return canvas;
    },
    interpolateRGBA: function (RGBA1, RGBA2, amount) {
        const RGBA1Split = RGBA1.substring(5, RGBA1.length - 2).split(',');
        const r1 = +RGBA1Split[0], g1 = +RGBA1Split[1], b1 = +RGBA1Split[2], a1 = +RGBA1Split[3];
        const RGBA2Split = RGBA2.substring(5, RGBA2.length - 2).split(',');
        const r2 = +RGBA2Split[0], g2 = +RGBA2Split[1], b2 = +RGBA2Split[2], a2 = +RGBA2Split[3];
        const interpolated = [Math.round((r1 + (r2 - r1) * amount)), Math.round((g1 + (g2 - g1) * amount)),
        Math.round((b1 + (b2 - b1) * amount)), (a1 + (a2 - a1) * amount)];
        return `rgba(${interpolated.join(',')})`;
    }
};