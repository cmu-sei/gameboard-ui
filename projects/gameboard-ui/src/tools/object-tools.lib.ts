export function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
    if (a.length !== b.length)
        return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }

    return true;
}

export function deepEquals<T1 extends {}, T2 extends {}>(obj1: T1, obj2: T2): boolean {
    const finalObj1: any = {};
    const finalObj2: any = {};

    for (const key in obj1) {
        if (obj1[key] !== undefined)
            finalObj1[key] = obj1[key];
    }

    for (const key in obj2) {
        if (obj2[key] !== undefined)
            finalObj2[key] = obj2[key];
    }

    return JSON.stringify(finalObj1) === JSON.stringify(finalObj2);
}

export function cloneNonNullAndDefinedProperties<T extends {}>(input: T): T {
    const retVal = {} as T;

    for (let property in input) {
        if (input[property] !== null && input[property] !== undefined)
            retVal[property] = input[property];
    }

    return retVal;
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
