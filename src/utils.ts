export const unionBy = (array: any[], key: string) => {
    const existed: string[] = [];

    if (!Array.isArray(array)) {
        throw Error(`[${array}] must be array`);
    }

    return array.filter(item => {
        if (existed.includes(item[key])) {
            return false;
        }

        return Boolean(existed.push(item[key]));
    });
};