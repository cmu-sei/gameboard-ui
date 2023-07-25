export function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
    if (a.length !== b.length)
        return false;

    const aSorted = [...a.sort()];
    const bSorted = [...b.sort()];

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }

    return true;
}

export function deepEquals<T1, T2>(obj1: T1, obj2: T2): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function isEmpty(obj: any): boolean {
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return true;
}

export function getAllProperties(obj: any) {
    const allProps: string[] = [];
    let current: any = obj;

    while (current) {
        Object.getOwnPropertyNames(current).forEach(prop => {
            allProps.push(prop);
        });

        current = Object.getPrototypeOf(current);
    }

    return allProps.sort();
}
