import {elements, elementType, IElement, IExportedElement} from "./elements";
import {
    AppendixProps,
    IConstructedRecognition, IRecognition, IRecognitionBuilder, IRecognitionItem, IRecognizerProps,
    IResolvedRecognition,
    PointerProps,
} from "./declarations";
import * as moment from "moment";
import {unionBy} from "./utils";
import {Moment} from "moment";

const defaultProps: IRecognizerProps = {
    now: moment().toISOString(),
};

export const recognize = (text: string, props: IRecognizerProps = defaultProps): IRecognitionBuilder => {

    const {now} = props;
    const flow: string[] = text.split(' ').filter(item => item !== '');

    // /** @deprecated */
    // const recognition: IRecognition = flow
    //     .map((value: string, index: number) => {
    //         const element = identifyElement(value, index);
    //         return {element, value, context: getContext(flow, index)};
    //     })
    //     .reduce((acc, current) => {
    //         return {
    //             ...acc,
    //             [current.element.type]: !!acc[current.element.type]
    //                 ? [...acc[current.element.type], current]
    //                 : [current]
    //         };
    //
    //     }, {} as IRecognition);

    const recognition = flow
        .map((value: string, index: number) => {
            const element = identifyElement(value, index);
            return {element, value}; //TODO Remove value (dup)
        })
        .reduce((acc, current) => acc.map(c => [...c, current]), [[]])
        .reduce((_, arr) => {
            return arr
                .map((current, index) => {
                    return Object.assign(current, {
                        context: [-1,1].map(step => (arr[index + step] || null))
                    })
                });
        }, [])
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

// /** @deprecated */
// export const getContext = (flow: string[], index: number): IElement[] => {
//
//     if (index === -1) {
//         return null;
//     }
//
//     return [-1, 1]
//         .map(operator => identifyElement(flow[index + operator], index + operator));
// };

export const getContext = (item: IRecognitionItem) => {

    if (!item) {
        return null;
    }

    const LEFT = "left";
    const RIGHT = "right";

    const _generateDirection = (steps: number, direction: string) => {
        if (steps < 1) {
            return item;
        }

        const _item = item.context[{[LEFT]: 0, [RIGHT]: 1}[direction]];

        if (_item === null) {
            return {} as IRecognitionItem;
        }

        return getContext(_item)[direction](--steps);
    };

    const left = (steps: number = 1) => _generateDirection(steps, LEFT);

    const right = (steps: number = 1) => _generateDirection(steps, RIGHT);

    const step = (steps: number = 1) => {
        const direction = steps < 0 ? LEFT : RIGHT;
        return _generateDirection(Math.abs(steps), direction);
    };

    return { left, right, step };
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

    const _returnDate = (result: Moment) => {
        return {
            date: [
                {type: "year", value: result.year()},
                {type: "months", value: result.month()},
                {type: "time", value: result.date()},
            ],
            ..._returnTime(result),
        }
    };

    const _returnTime = (result: Moment) => {
        return {
            time: [
                {type: "hour", value: result.hour()},
                {type: "minutes", value: result.minutes()},
            ],
        }
    };

    const _resolvePointers = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => {
                return {
                    [PointerProps.To]: function RussianContextStrategy() {
                        const right: IElement = getContext(item).right(1).element;

                        if (right.type && right.type === "task") {
                            return {task: [item.element]};
                        }

                        return {};
                    },
                }[item.element.key]
            })
            .filter(item => item)
            .map(item => item())
            .reduce(getMergedRecognition, acc);
    };

    // const _resolveMonths = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {
    //
    //     return items
    //         .map(item => {
    //             const [left, right] = item.context;
    //
    //             // If item's monthDay or month is lower than current month
    //             // it means user wants month of the next year.
    //             const currentMonth: number = new Date().getMonth();
    //             const currentYear: number = new Date().getFullYear();
    //             const currentMonthDay = new Date().getDate();
    //             const month: number = Number(item.element.key);
    //
    //             const monthInPast = Number(month) < Number(currentMonth);
    //             const dayInPast = Number(left.value) < Number(currentMonthDay);
    //
    //             const value: string = (dayInPast || monthInPast ? currentYear + 1 : currentYear).toString();
    //             const year: IElement = { type: "year", value };
    //
    //             return left.type === "time"
    //                 ? {date: [ left, item.element, year ]}
    //                 : {date: [ item.element, year ]};
    //         })
    //         .reduce(getMergedRecognition, acc);
    // };
    //
    const _resolveTime = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        const _pointerIN = (item: IRecognitionItem) => {
            const right: IElement = getContext(item).right().element;
            const {value}         = item.element;

            if (!right) {
                return {task: [item.element]};
            }

            // For now if right context is not an appendix
            // it means item and its context are just TASK
            if (right.type !== "appendix") {
                return {task: [item.element]}
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

            return _returnDate(result);
        };

        const _pointerTO = (item: IRecognitionItem) => {
            const right: IElement = getContext(item).right().element;
            const {value}         = item.element;

            if (!right
                || right.type === "pointer"
                || right.type === "appendix") {
                const result = moment(now)
                    .hour(Number(item.element.value))
                    .minute(0);

                return _returnDate(result);
            }

        };

        return items
            .map(item => {

                const left: IElement = getContext(item).left().element;
                const right: IElement = getContext(item).right().element;

                if (left && left.type === "pointer") {

                    if (Number(left.key) === PointerProps.In) {
                        return _pointerIN(item);
                    }

                    if (Number(left.key) === PointerProps.To) {
                        return _pointerTO(item);
                    }
                }

                return {};

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
    //
    // const _resolveDays = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {
    //
    //     return items
    //         .map(item => ({ date: [item.element] }))
    //         .reduce(getMergedRecognition, acc);
    // };
    //
    const _resolveLexical = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .filter(item => item)
            .map(item => {

                // Every lexical word has its own numerical value.
                // we have to add this value to current date number
                // for taking actual date offset.
                const offset: number = Number(item.element.key);
                const result: Moment = moment(now).add(offset, "day");

                // return _returnDate(result);
                return {
                    date: [{ type: "time", value: result.date(), priority: 10 }],
                    ..._returnTime(result)
                }
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
        // The main rule here is to return from each method only according types
        switch (type) {
            case "pointer":
                return _resolvePointers(acc, recognition[type]);

// case "months":
//     return _resolveMonths(acc, recognition[type]);

            case "task":
                return _resolveTasks(acc, recognition[type]);
//
// case "days":
//     return _resolveDays(acc, recognition[type]);
//
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
            .sort((a,b) => (a.priority || 0) - (b.priority || 0))
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
            .sort((a,b) => (a.priority || 0) - (b.priority || 0))
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
            .set({ ...fromTime, ...fromDate })
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