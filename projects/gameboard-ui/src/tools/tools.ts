// thank you, SO: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */

export function groupBy<K, V>(list: V[], keyGetter: (item: V) => K) {
    const map = new Map<K, Array<V>>();

    list.forEach(item => {
        const key = keyGetter(item);
        const collection = map.get(key);

        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    return map;
}

export function unique<T>(array: T[]): T[] {
    return array.filter((value, index, arr) => arr.indexOf(value) === index);
}

export enum MimeTypes {
    Gif = "image/gif",
    Jpeg = "image/jpeg",
    Png = "image/png",
    Svg = "image/svg+xml",
    Webp = "image/webp"
}
