import {elements, elementType, IElement, IExportedElement} from "./elements";
import {IResolvedRecognition, IRecognitionBuilder, IRecognitionItem, PointerProps} from "./declarations";

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

    const resolved: IResolvedRecognition = {
        text,
        task   : [],
        time   : [],
        date   : [],
        garbage: []
    };

    const resolvePointers = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        const resolved = items
            .map(item => {

                return {
                    [PointerProps.To]: function RussianContextStrategy() {
                        const [left, right] = item.context;

                        return right.type === "time" ? {time: [right]} : acc.task.push(item.element);
                    }
                }[item.element.key]

            })
            .filter(item => item)
            .map(item => item())
            .reduce((accItem, item) => ({...accItem, ...item}), {});

        return {...acc, ...resolved};
    };

    const resolveMonths = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        const resolved = items
            .map(item => {
                const [left, right] = item.context;

                return left.type === "time" ? {date: [left]} : {date: []};
            })
            .reduce((accItem, item) => ({...accItem, ...item}), {} as { date: IElement[] });

        resolved.date.push(...items.map(i => i.element));
        return {...acc, ...resolved};
    };

    const resolveTasks = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {
        return {
            ...acc,
            task: items.map(i => i.element)
        }
    };

    return Object.keys(recognition).reduce((acc, type: elementType): any => {

        switch (type) {
            case "months":
                return resolveMonths(acc, recognition[type]);
            // case "days":
            // case "lexical":
            case "pointer":
                return resolvePointers(acc, recognition[type]);
            //     return {...acc, date: [...acc.date, ...recognition[type] ]};

            //
            // case "lexical":
            //     return {...acc, lexical: [...acc.lexical, current]};
            //
            // case "time":
            //
            //     return {...acc, time: [...acc.time, ...recognition[type]]};

            case "task":
                return resolveTasks(acc, recognition[type]);

            // case "pointer":
            //     return {...acc, pointer: [...acc.pointer, current]};
            //
            // case "appendix":
            //     return {...acc, appendix: [...acc.appendix, current]};

            default:
                return {...acc, garbage: [...acc.garbage, ...recognition[type]]};
        }

    }, resolved);

    // console.log(a);
    // return null;
};