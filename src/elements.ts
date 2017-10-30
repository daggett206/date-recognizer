import {days, lexical, months, task, time, pointer, appendix, action} from "./declarations";

export type element = 'month'
    | 'day'
    | 'lexical'
    | 'time'
    | 'task'
    | 'pointer'
    | 'appendix'
    | 'action';

const _extract = ({type, values}) => {
    const _values = Object.keys(values)
        .map(key => values[key])
        .reduce((acc, val) => [...acc, ...val]);

    return {type, values: _values};
};

export const elements = [
    {type: "task", values: task},
    {type: "time", values: time},
    {type: "month" , values: months},
    {type: "day", values: days},
    {type: "lexical", values: lexical},
    {type: "pointer", values: pointer},
    {type: "appendix", values: appendix},
    {type: "action", values: action},
].map(_extract);