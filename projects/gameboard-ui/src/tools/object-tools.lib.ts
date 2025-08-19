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

/**
 * Serializes an object to FormData. Particularly useful for objects that
 * can't be serialized to JSON for submission to the API (commonly, objects that have File
 * properties). For these, we typically have the api accept multipart/form-data and serialize
 * the object into a form with two values: the file, and the rest of the object.
 * 
 * NOTE: As implemented, does not work for complex objects (with object properties).
 * 
 * @param obj An object to serialize to FormData.
 */
export function toFormData<T>(obj: T, formPropertyName: string): FormData {
    const formData = new FormData();

    let k: keyof typeof obj;
    for (k in obj) {
        const value = obj[k];

        if (value === undefined || value === null) {
            continue;
        }
        else if (value instanceof Blob) {
            formData.append(`${formPropertyName}.${String(k)}`, value);
        }
        if (obj[k]) {
            formData.append(`${formPropertyName}.${String(k)}`, String(value));
        }
    }

    return formData;
}
