export const unionBy = (array: any[], key: string) => {
    const existed: string[] = [];

    if (!Array.isArray(array)) {
        throw Error(`[${array}] must be array`);
    }

    return array.filter(item => {
        if (item[key] === undefined) {
            return true;
        }

        if (existed.includes(item[key])) {
            return false;
        }

        return Boolean(existed.push(item[key]));
    });
};

export const pipe = (...fns) =>
    firstInput =>
        fns.reduce((prevFnResult, fn) => fn(prevFnResult), firstInput);