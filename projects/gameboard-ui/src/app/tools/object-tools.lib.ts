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
