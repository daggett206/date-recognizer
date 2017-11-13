import {elements, elementType, IElement, IExportedElement} from "./elements";
import {
    IConstructedRecognition, IRecognitionBuilder, IRecognitionItem, IResolvedRecognition,
    PointerProps
} from "./declarations";
import {unionBy} from "./utils";

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

    const resolvePointers = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => {

                return {
                    [PointerProps.To]: function RussianContextStrategy() {
                        const [left, right] = item.context;
                        const resolved = {...acc, [right.type]: [right]};

                        if (right.type === "task") {
                            resolved.task.push(item.element);
                        }

                        if (right.type === "days") {
                            resolved.date.push(right);
                        }

                        return resolved;
                    }
                }[item.element.key]
            })
            .filter(item => item)
            .map(item => item())
            .reduce(getMergedRecognition, acc);
    };

    const resolveMonths = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => {
                const [left, right] = item.context;

                return left.type === "time" ? {date: [left, item.element]} : {date: [item.element]};
            })
            .reduce(getMergedRecognition, acc);
    };

    const resolveDays = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

        return items
            .map(item => ({ date: [item.element] }))
            .reduce(getMergedRecognition, acc);
    };

    const resolveTasks = (acc: IResolvedRecognition, items: IRecognitionItem[]): IResolvedRecognition => {

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
                return resolvePointers(acc, recognition[type]);

            case "months":
                return resolveMonths(acc, recognition[type]);

            case "task":
                return resolveTasks(acc, recognition[type]);

            case "days":
                return resolveDays(acc, recognition[type]);

            // case "lexical":
            //     return {...acc, lexical: [...acc.lexical, current]};
            //
            // case "time":
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

export const constructRecognition = (resolved: IResolvedRecognition): Partial<IConstructedRecognition> => {
    const {text} = resolved;
    const task = resolved.task
        .sort((a,b) => a.index - b.index)
        .map(task => task.value)
        .reduce((acc, value) => `${acc} ${value}`.trim(), ``);

    console.log(resolved);

    return {
        text,
        task,
    }
};