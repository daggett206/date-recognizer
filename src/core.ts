import {elements, elementType, IElement, IExportedElement} from "./elements";
import {
    AppendixProps,
    IConstructedRecognition, IRecognition, IRecognitionBuilder, IRecognitionItem, IResolvedRecognition,
    PointerProps,
} from "./declarations";
import * as moment from "moment";
import {unionBy} from "./utils";

export const recognize = (text: string): Promise<IRecognitionBuilder> => {

    const flow: string[] = text.split(' ').filter(item => item !== '');
    const recognition: IRecognition = flow
        .map((value: string, index: number) => {
            const element = identifyElement(value, index);

            return {element, value, context: getContext(flow, index)};
        })
        .reduce((acc, current) => {
            return {
                ...acc,
                [current.element.type]: !!acc[current.element.type]
                    ? [...acc[current.element.type], current]
                    : [current]
            };

        }, {} as IRecognition);

    return Promise.resolve({recognition, text});
};

export const getContext = (flow: string[], index: number): IElement[] => {

    if (index === -1) {
        return null;
    }

    return [-1, 1]
        .map(operator => identifyElement(flow[index + operator], index + operator));
};

export const identifyElement = (current: string, index: number): IElement => {

    if (!current) {
        return null;
    }

    const _filterElement = (el: IExportedElement, current: string): boolean => {

        return el.values.some(item =>
            item.value.some(value => !!current.match(value)))
    };

    const _extractElement = (el: IExportedElement, current: string): IElement => {

        return {
            value: current,
            type : el.type,
            index,
            key  : el.values
                .filter(item => item.value.some(value => !!current.match(value)))
                .reduce((acc, element) => element.key, "")
        }
    };

    return elements
        .filter((element: IExportedElement) => _filterElement(element, current))
        .map((element: IExportedElement) => _extractElement(element, current))
        .reduce((acc, element: IElement) => element, {} as IElement);
};

export const resolveRecognition = (builder: IRecognitionBuilder): IResolvedRecognition => {

    const {text, recognition} = builder;

    const defaults: IResolvedRecognition = {
        text,
        task: [],
        time: [],
        date: [],
    };

    const _resolvePointers = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => {

                return {
                    [PointerProps.To]: function RussianContextStrategy() {
                        const [left, right] = item.context;
                        const resolved = {[right.type]: [right]}; // just removed ...acc; watch

                        if (right.type === "task") {
                            resolved.task.push(item.element);
                        }

                        if (right.type === "days") {
                            resolved.date.push(right);
                        }

                        if (left.type === "time") {
                            resolved.date.push(left);
                        }

                        return resolved;
                    }
                }[item.element.key]
            })
            .filter(item => item)
            .map(item => item())
            .reduce(getMergedRecognition, acc);
    };

    const _resolveMonths = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => {
                const [left, right] = item.context;

                // If item's month is lower than current month
                // it means user wants month of the next year.
                const currentMonth: number = new Date().getMonth();
                const currentYear: number = new Date().getFullYear();
                const month: number = Number(item.element.key);
                const value: string = (month < currentMonth ? currentYear + 1: currentYear).toString();

                const year: IElement = { type: "year", value };

                return left.type === "time"
                    ? {date: [ left, item.element, year ]}
                    : {date: [ item.element, year ]};
            })
            .reduce(getMergedRecognition, acc);
    };

    const _resolveTime = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        const _handleInCase = (item: IRecognitionItem) => {
            const [left, right] = item.context;
            const {value} = item.element;

            // For now if right context is not an appendix
            // it means item and its context are just TASK
            if (right.type !== "appendix") {
                return { task: [left, item.element, right] }
            }

            // TODO If the time is lower than now, add 1 to date
            console.log(`${moment().get('hour')}:${moment().add(value, 'minutes').get('minutes')}`);

            return {
                [AppendixProps.Years]: {
                    date:[ {type: "year", value: moment().add(value, 'years').get('year') }]
                },
                [AppendixProps.Months]: {
                    date:[ {type: "months", value: moment().add(value, 'months').get('month') }]
                },
                [AppendixProps.Days]: {
                    date:[ {type: "time", value: moment().add(value, 'days').get('date') }]
                },
                [AppendixProps.Hours]: {
                    time:[ {type: "time", value: moment().add(value, 'hours').get('hour') }]
                },
                [AppendixProps.Minutes]: {
                    date:[ {type: "time", value: `${moment().get('hour')}:${moment().add(value, 'minutes').get('minutes')}` }]
                },
            }[right.key]
        };

        return items
            .map(item => {
                const [left, right] = item.context;
                const CASE_IN = left.type === "pointer" && left.key === PointerProps.In.toString();

                if (CASE_IN) {
                    const a = _handleInCase(item);
                    console.log(a);
                    return a;
                    // resolved.task.push(item.element);
                }

                // if (right.type === "days") {
                //     resolved.date.push(right);
                // }
                //
                // if (left.type === "time") {
                //     resolved.date.push(left);
                // }
            })
            .filter(i => !!i)
            .reduce(getMergedRecognition, acc);
    };

    const _resolveDays = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => ({ date: [item.element] }))
            .reduce(getMergedRecognition, acc);
    };

    const _resolveLexical = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .filter(item => item)
            .map(item => {

                // Every lexical word has its own numerical value.
                // we have to add this value to current date number
                // for taking actual date offset.
                const offset: number = Number(item.element.key);
                const date: number = new Date().getDate();
                const value: string = String(date + offset);
                const element: IElement = { type: "time", value };

                return { date: [element] };
            })
            .reduce(getMergedRecognition, acc);
    };

    const _resolveTasks = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => ({ task: [item.element] }))
            .reduce(getMergedRecognition, acc);
    };

    const getMergedRecognition = (accItem, item) => {

        return {
            ...accItem,
            task: unionBy(!!item.task ? [ ...accItem.task, ...item.task ] : accItem.task , "index"),
            time: unionBy(!!item.time ? [ ...accItem.time, ...item.time ] : accItem.time , "index"),
            date: unionBy(!!item.date ? [ ...accItem.date, ...item.date ] : accItem.date , "index"),
        }
    };

    return Object.keys(recognition).reduce((acc, type: elementType): any => {

        switch (type) {
            case "pointer":
                return _resolvePointers(acc, recognition[type]);

            case "months":
                return _resolveMonths(acc, recognition[type]);

            case "task":
                return _resolveTasks(acc, recognition[type]);

            case "days":
                return _resolveDays(acc, recognition[type]);

            case "lexical":
                return _resolveLexical(acc, recognition[type]);

            case "time":
                return _resolveTime(acc, recognition[type]);
            //
            //     return {...acc, time: [...acc.time, ...recognition[type]]};
            //
            // case "appendix":
            //     return {...acc, appendix: [...acc.appendix, current]};

            default:
                return acc;
        }

    }, defaults);
};

export const constructRecognition = (resolved: IResolvedRecognition): IConstructedRecognition => {

    const _constructDate = (): Date => {

        const fromDate = resolved.date
            .filter(i => !!i)
            .reduce((acc, item) => {

                switch (item.type) {
                    case "year":
                        return {...acc, year: item.value};

                    case "months":
                        return {...acc, month: item.key};

                    // day of month
                    case "time":
                        return {...acc, date: item.value};

                    case "days":
                        return {...acc, day: item.key};

                }

                return {...acc};
            }, {});

        const fromTime = resolved.time
            .filter(i => !!i)
            .reduce((acc, item) => {

                switch (item.type) {
                    //TODO Add minutes and hours
                    case "time":
                        const [hour, minute = 0] = item.value.split(":");
                        return {...acc, hour, minute};
                }

                return {...acc};
            }, {});

        return moment()
            .set({ ...fromDate, ...fromTime })
            .toDate();
    };

    const _constructTask = (): string => {
        return resolved.task
            .sort((a,b) => a.index - b.index)
            .map(task => task.value)
            .reduce((acc, value) => `${acc} ${value}`.trim(), ``);
    };

    const {text} = resolved;
    const task = _constructTask();
    const date = _constructDate();

    return { text, task, date, remind: null }
};