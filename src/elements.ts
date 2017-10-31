import {days, lexical, months, task, time, pointer, appendix, action, recognitions} from "./declarations";

export type elementType = 'month'
    | 'day'
    | 'lexical'
    | 'time'
    | 'task'
    | 'pointer'
    | 'appendix'
    | 'action';

export interface IElement {
    type: elementType;
    key: string;
}

export interface IExportedElement {
    type: elementType;
    values: {
        key: string;
        value: RegExp[];
    }[]
}

const _extract = (type): IExportedElement => {

    const values = Object
        .keys(recognitions[type])
        .reduce((acc, key) => [ ...acc, {key, value: recognitions[type][key]} ], []);

    return {type, values};
};

export const elements = [
    "task",
    "time",
    "months",
    "days",
    "lexical",
    "pointer",
    "appendix",
    "action",
].map(_extract);