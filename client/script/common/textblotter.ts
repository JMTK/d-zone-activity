'use strict';
import BetterCanvas from './bettercanvas';

const charSets = {
    upper: {
        y: 0,
        height: 8,
        xSpacing: 1,
        chars: [
            ['A', 5], ['B', 5], ['C', 5], ['D', 5], ['E', 4], ['F', 4], ['G', 5], ['H', 5], ['I', 3], ['J', 5],
            ['K', 5], ['L', 4], ['M', 5], ['N', 5], ['O', 5], ['P', 5], ['Q', 5], ['R', 5], ['S', 5], ['T', 5],
            ['U', 5], ['V', 5], ['W', 5], ['X', 5], ['Y', 5], ['Z', 5]
        ]
    },
    lower: {
        y: 8,
        height: 11,
        xSpacing: 1,
        chars: [
            ['a', 5], ['b', 4], ['c', 4], ['d', 4], ['e', 4], ['f', 4], ['g', 4], ['h', 4], ['i', 1], ['j', 2],
            ['k', 4], ['l', 1], ['m', 5], ['n', 4], ['o', 4], ['p', 4], ['q', 4], ['r', 4], ['s', 4], ['t', 4],
            ['u', 4], ['v', 5], ['w', 5], ['x', 4], ['y', 4], ['z', 4], [' ', 4]
        ]
    },
    numsAndSymbols: {
        y: 19,
        xSpacing: 1,
        height: 8,
        chars: [
            ['0', 4], ['1', 3], ['2', 4], ['3', 4], ['4', 4], ['5', 4], ['6', 4], ['7', 4], ['8', 4], ['9', 4],
            ['`', 2], ['~', 6], ['!', 1], ['@', 7], ['#', 7], ['$', 4], ['%', 5], ['^', 5], ['&', 6], ['*', 3], ['(', 2],
            [')', 2], ['_', 5], ['=', 5], ['-', 5], ['+', 5], ['|', 1], [',', 2], ['.', 1], ['<', 5], ['>', 5], ['?', 4],
            ['/', 3], ['\\', 3], [';', 1], [':', 1], ["'", 1], ['"', 3], ['[', 2], [']', 2], ['{', 3], ['}', 3]
        ]
    },
    icons: {
        count: 4,
        y: 27,
        height: 12,
        chars: [
            [':icon-npm:', 12], [':icon-github:', 12], [':icon-lock:', 12], [':icon-lock-small:', 12]
        ]
    },
    accented1: {
        y: 39,
        xSpacing: 1,
        height: 13,
        oy: -2,
        chars: [
            ['á', 5], ['Á', 5], ['à', 5], ['À', 5], ['â', 5], ['Â', 5], ['ä', 5], ['Ä', 5], ['ã', 5], ['Ã', 5], ['å', 5], ['Å', 5],
            ['æ', 7], ['Æ', 7], ['ç', 4], ['Ç', 5], ['é', 4], ['É', 4], ['è', 4], ['È', 4], ['ê', 4], ['Ê', 4], ['ë', 4], ['Ë', 4],
            ['í', 2], ['Í', 3], ['ì', 2], ['Ì', 3], ['î', 3], ['Î', 3], ['ï', 3], ['Ï', 3]
        ]
    },
    accented2: {
        y: 52,
        xSpacing: 1,
        height: 10,
        oy: -2,
        chars: [
            ['ñ', 4], ['Ñ', 5], ['ó', 4], ['Ó', 5], ['ò', 4], ['Ò', 5], ['ô', 4], ['Ô', 5], ['ö', 4], ['Ö', 5],
            ['õ', 4], ['Õ', 5], ['ø', 4], ['Ø', 5], ['œ', 7], ['Œ', 8], ['ß', 5], ['ú', 4], ['Ú', 5], ['ù', 4],
            ['Ù', 5], ['û', 4], ['Û', 5], ['ü', 4], ['Ü', 5]
        ]
    }
};

const fontMap = {};

for (const csKey in charSets) {
    if (!(csKey in charSets)) continue;
    const charSet = charSets[csKey];
    let rx = 0;
    for (const charSetchars of charSet.chars) {
        const char = charSetchars[0], width = charSetchars[1] + (charSet.xSpacing || 0);
        fontMap[char] = {
            x: rx,
            y: charSet.y,
            w: width,
            h: charSet.height,
            char: char,
            oy: charSet.oy
        };
        rx += width;
    }
}
const padding = {
    x: 4,
    y: 3
};
const vertOffset = 1;
let image;

export interface BlotOptions { maxWidth?: number, x?: number, y?: number, canvas?: BetterCanvas, maxChars?: number, lineStart?: number, lineCount?: number, metrics?: any, bg?: string, text?: string }
export default {
    /**
     * Renders a blot (a text block) on a canvas with optional customization options.
     *
     * @param {Object} options - The customization options for the blot.
     * @param {number} [options.x=0] - The x-coordinate of the top-left corner of the blot.
     * @param {number} [options.y=0] - The y-coordinate of the top-left corner of the blot.
     * @param {BetterCanvas} [options.canvas] - The canvas to render the blot on. If not provided, a new canvas is created.
     * @param {number} [options.maxChars] - The maximum number of characters to render.
     * @param {number} [options.lineStart=0] - The index of the line to start rendering from.
     * @param {number} [options.lineCount] - The number of lines to render. If not provided, all lines are rendered.
     * @param {Object} [options.metrics] - The metrics of the blot. If not provided, the metrics are calculated.
     * @param {string} [options.bg] - The background color of the canvas. If provided, the canvas is filled with this color before rendering the blot.
     * @param {string} [options.text] - The text to render. If not provided, the text is taken from the metrics.
     * @return {HTMLCanvasElement} The canvas with the rendered blot.
     */
    loadImage: function (img) {
        image = img;
    },
    blot: function (options: BlotOptions) {
        const x = options.x ?? 0, y = options.y ?? 0;
        const metrics = options.metrics || this.calculateMetrics(options);
        const lineStart = options.lineStart ? options.lineStart : 0;
        const lineCount = options.lineCount ? Math.min(metrics.lines.length, options.lineCount)
            : metrics.lines.length;
        const canvas = options.canvas ?? new BetterCanvas(
            padding.x * 2 + x + metrics.w - 1,
            padding.y * 2 + y + lineCount * 10
        );
        if (options.bg) canvas.fill(options.bg);
        let charCount = 0;
        for (let l = lineStart; l < Math.min(metrics.lines.length, lineStart + lineCount); l++) {
            let maxChars = metrics.lines[l].chars.length;
            if (options.maxChars) maxChars = Math.min(maxChars, options.maxChars - charCount);
            for (let c = 0; c < maxChars; c++) {
                const char = metrics.lines[l].chars[c];
                if (char.char.text == ' ') continue;
                canvas.drawImage(image, char.char.x, char.char.y, char.w, char.char.h,
                    padding.x + x + char.x, padding.y + y + (l - lineStart) * 10 + (char.oy || 0) + vertOffset,
                    char.w, char.char.h, 1);
            }
            charCount += metrics.lines[l].chars.length;
        }
        return canvas.canvas;
    },
    transition: function (options) {
        const metrics = options.metrics || this.calculateMetrics(options);
        const canvas = options.canvas || new BetterCanvas(
            metrics.w + padding.x * 2,
            (options.lineCount || metrics.lines.length) * 10 + padding.y * 2
        );
        const fillWidth = Math.max(2, Math.max(0, options.progress - 0.25) / 0.75 * canvas.canvas.width);
        const fillHeight = Math.min(1, options.progress * 4) * canvas.canvas.height * -1;
        canvas.fillRect(options.bg, (canvas.canvas.width - fillWidth) / 2, canvas.canvas.height,
            fillWidth, fillHeight);
        return canvas.canvas;
    },
    calculateMetrics: function (options) {
        // TODO: Normalize line lengths so there are no single-word remainders
        const text = options.text;
        const lines: { chars: { x: number, char: any, oy?: number }[], w: number }[] = [];
        const words = text.split(' ');
        const space = fontMap[' '];
        let lineWidth = 0, lineChars: { x: number, char: any, w: number, oy?: number }[] = [], maxLineWidth = 0;
        for (let w = 0; w < words.length; w++) {
            const word = words[w];
            if (word == '') continue; // Skip empty words
            let wordWidth = 0;
            let wordChars: { x: number, char: any, w: number, oy?: number }[] = [];
            if (lineChars.length > 0) { // Add space before word unless starting a line
                wordChars.push({
                    x: lineWidth,
                    char: space,
                    w: space.w
                });
                wordWidth += space.w;
            }
            if (word.length > 1 && fontMap[word]) { // Icon codes
                wordChars.push({
                    x: lineWidth + wordWidth,
                    char: fontMap[word],
                    w: fontMap[word].w,
                    oy: -2
                });
                wordWidth += fontMap[word].w;
            }
            else {
                for (const letter of word) {
                    const ltr = fontMap[letter] || space;
                    wordChars.push({
                        x: lineWidth + wordWidth,
                        char: ltr,
                        w: ltr.w,
                        oy: ltr.oy
                    });
                    wordWidth += ltr.w;
                }
            }
            if (options.maxWidth && lineWidth + wordWidth > options.maxWidth) {
                if (wordWidth > options.maxWidth) { // Word is longer than maxWidth, won't fit any line
                    if (lineWidth > 0) {
                        lines.push({
                            w: lineWidth,
                            chars: lineChars
                        });
                        maxLineWidth = Math.max(lineWidth, maxLineWidth);
                        lineWidth = 0; lineChars = [];
                    }
                    wordChars = [];
                    wordWidth = 0;
                    for (let b = 0; b < word.length; b++) {
                        const ltrB = fontMap[word[b]] || space;
                        if (lineWidth + wordWidth + ltrB.w < options.maxWidth) {
                            wordChars.push({
                                x: lineWidth + wordWidth,
                                char: ltrB,
                                w: ltrB.w,
                                oy: ltrB.oy
                            });
                            wordWidth += ltrB.w;
                        }
                        else {
                            const trimWidth = (lineWidth + wordWidth + ltrB.w) - options.maxWidth;
                            wordChars.push({
                                x: lineWidth + wordWidth,
                                char: ltrB,
                                w: ltrB.w - trimWidth,
                                oy: ltrB.oy
                            });
                            wordWidth += ltrB.w - trimWidth;
                            break;
                        }
                    }
                    lineWidth += wordWidth;
                    lineChars = lineChars.concat(wordChars);
                }
                else { // Word can be pushed to next line
                    w--;
                }
                lines.push({
                    w: lineWidth,
                    chars: lineChars
                });
                maxLineWidth = Math.max(lineWidth, maxLineWidth);
                lineWidth = 0; lineChars = [];
            }
            else { // Word fits on line
                lineWidth += wordWidth;
                lineChars = lineChars.concat(wordChars);
                if (w == words.length - 1) {
                    lines.push({
                        w: lineWidth,
                        chars: lineChars
                    });
                    maxLineWidth = Math.max(lineWidth, maxLineWidth);
                }
            }
        }
        return {
            lines: lines,
            text: text,
            w: maxLineWidth
        };
    },
    fontMap: fontMap
};