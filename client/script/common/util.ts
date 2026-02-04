export default {
    log: function (...args: any[]) {
        console.log('DZONE:', ...args);
    },
    sleep: function (ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    randomIntRange: function (min: number, max: number) {
        return Math.floor(Math.random() * (+max - +min + 1)) + +min;
    },
    pickInArray: function (arr: any[]) {
        return arr[this.randomIntRange(0, arr.length - 1)];
    },
    pickInObject: function (obj: any) { // Return random property name from object
        return this.pickInArray(Object.keys(obj));
    },
    findAndRemove: function (elem: any, arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === elem) {
                arr.splice(i, 1);
                i--;
            }
        }
    },
    right: function (text: string, length: number) {
        return text.substring(text.length - length, text.length);
    },
    clamp: function (val: number, min: number, max: number) {
        return Math.min(max, Math.max(min, val));
    },
    clampWrap: function (val: number, min: number, max: number) { // Clamp to range by wrapping value
        const wrap = (val - min) % (max + 1 - min);
        return wrap >= 0 ? min + wrap : max + 1 + wrap;
    },
    fractionalArrayIndex: function (arr: any[], index: number) {
        const floorX = Math.floor(index);
        const lower = arr[floorX];
        if (floorX == index) return lower;
        const upper = arr[Math.ceil(index)];
        const fraction = index - Math.floor(index);
        return (lower + ((upper - lower) * fraction));
    },
    getURLParameter: function (name: string) {
        return decodeURIComponent(
            (new RegExp(`[?|&]${name}=([^&;]+?)(&|#|;|$)`)
                // eslint-disable-next-line no-sparse-arrays
                .exec(location.search) ?? [, ''])[1].replace(/\+/g, '%20')) || null;
    },
    abbreviate: function (text: string, blacklist: any[]) {
        const split = text.split(' ');
        const alpha = /[a-z0-9]/i;
        let result = '';
        for (let w = 0; w < split.length; w++) {
            for (let l = 0; l < split[w]!.length; l++) {
                if (alpha.test(split[w]![l]!)) {
                    result += split[w]![l];
                    break;
                }
            }
        }
        if (result.trim() == '') result = '1';
        if (blacklist && blacklist.indexOf(result) >= 0) {
            let variation = 0;
            result += variation;
            do {
                variation++;
                result = result.substring(0, result.length - 1) + variation;
            } while (blacklist.indexOf(result) >= 0);
        }
        return result;
    },
    alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    vowels: ['a', 'e', 'i', 'o', 'u'],
    consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
    hex: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
};