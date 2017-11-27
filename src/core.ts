import {elements, elementType, IElement, IExportedElement} from "./elements";
import {
    AppendixProps,
    IConstructedRecognition, IRecognition, IRecognitionBuilder, IRecognitionItem, IRecognizerProps,
    IResolvedRecognition,
    PointerProps,
} from "./declarations";
import * as moment from "moment";
import {unionBy} from "./utils";

const defaultProps: IRecognizerProps = {
    now: moment().toISOString(),
};

export const recognize = (text: string, props: IRecognizerProps = defaultProps): IRecognitionBuilder => {

    const {now} = props;
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

    return {recognition, text, now};
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
            index,
            value: current,
            type : el.type,
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
    const {text, recognition, now} = builder;

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
                        const resolved = {[right.type]: [right]};

                        console.log(left, right);

                        if (right && right.type === "task") {
                            resolved.task.push(item.element);
                        }

                        if (right && right.type === "days") {
                            resolved.date.push(right);
                        }

                        if (left && left.type === "time") {
                            resolved.date.push(left);
                        }

                        return resolved;
                    },
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

                // If item's monthDay or month is lower than current month
                // it means user wants month of the next year.
                const currentMonth: number = new Date().getMonth();
                const currentYear: number = new Date().getFullYear();
                const currentMonthDay = new Date().getDate();
                const month: number = Number(item.element.key);

                const monthInPast = Number(month) < Number(currentMonth);
                const dayInPast = Number(left.value) < Number(currentMonthDay);

                const value: string = (dayInPast || monthInPast ? currentYear + 1 : currentYear).toString();
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
            const {value}       = item.element;

            // For now if right context is not an appendix
            // it means item and its context are just TASK
            if (right.type !== "appendix") {
                return {task: [item.element]}
                // return { task: [left, item.element, right] }
            }

            const createAppendix = (dateUnit: string) =>
                () => moment(now).add(value as moment.unitOfTime.DurationConstructor, dateUnit);

            const result = [
                ['' + AppendixProps.Years, 'years'],
                ['' + AppendixProps.Months, 'months'],
                ['' + AppendixProps.Days, 'days'],
                ['' + AppendixProps.Hours, 'hours'],
                ['' + AppendixProps.Minutes, 'minutes'],
            ]
                .reduce((acc, [key, dateUnit]) => ({ ...acc, [key]: createAppendix(dateUnit) }), {})[right.key]();

            return {
                date: [
                    {type: "year", value: result.year()},
                    {type: "months", value: result.month()},
                    {type: "time", value: result.date()},
                ],
                time: [
                    {type: "hour", value: result.hour()},
                    {type: "minutes", value: result.minutes()},
                ],
            }

        };

        return items
            .map(item => {

                const [left, right] = item.context;
                const CASE_IN = left && left.type === "pointer" && left.key === PointerProps.In.toString();
                if (CASE_IN) {
                    const a = _handleInCase(item);
                    // console.log(a);
                    return a;
                    // resolved.task.push(item.element);
                }

                return acc;

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
                        return {...acc, month: item.key || item.value};

                    // day of month
                    case "time":
                        return {...acc, date: item.value};

                    case "days":
                        return {...acc, day: item.key || item.value};

                }

                return {...acc};
            }, {});

        const fromTime = resolved.time
            .filter(i => !!i)
            .reduce((acc, item) => {

                switch (item.type) {
                    case "time":
                        const [hour, minute = 0] = item.value.split(":");
                        return {...acc, hour, minute};

                    case "hour":
                        return {...acc, hour: item.value};

                    case "minutes":
                        return {...acc, minutes: item.value};
                }

                return {...acc};
            }, {});

        return moment()
            .set({ ...fromDate, ...fromTime })
            //reset bcs we don't need it
            .seconds(0)
            .millisecond(0)
            //end of reset
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