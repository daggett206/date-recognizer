import {elements, elementType, IElement, IExportedElement} from "./elements";
import {IConstructedRecognition, IRecognition, IRecognitionBuilder} from "./declarations";

export const getContext = (flow: string[], value: string): IElement[] => {
    const index = flow.indexOf(value);

    if (index === -1) {
        return null;
    }

    return [-1,1]
        .filter(operator => flow[index + operator])
        .map(operator => identifyElement(flow[index + operator]));
};

export const identifyElement = (current: string): IElement => {

    if (!current) {
        return null;
    }

    const _filterElement = (el: IExportedElement, current: string): boolean => {
        return el.values.some(item =>
            item.value.some(value => !!current.match(value)))
    };

    const _extractElement = (el: IExportedElement, current: string): IElement => {
        return {
            type: el.type,
            key: el.values
                .filter(item => item.value.some(value => !!current.match(value)))
                .reduce((acc, element) => element.key, "")
        }
    };

    return elements
        .filter((element: IExportedElement) => _filterElement(element, current))
        .map((element: IExportedElement) => _extractElement(element, current))
        .reduce((acc, element: IElement) => element, {} as IElement);
};

export const constructRecognition = (builder: IRecognitionBuilder): IConstructedRecognition => {

    const { text, recognition } = builder;

    const constructed: IConstructedRecognition = {
        text,
        task: [],
        time: [],
        date: []
    };

    const a = Object.keys(recognition).reduce((acc, type: elementType): IConstructedRecognition => {

        switch (type) {
            case "months":
            case "days":
            case "lexical":
            case "pointer":

                return {...acc, date: [...acc.date, ...recognition[type] ]};

            //
            // case "lexical":
            //     return {...acc, lexical: [...acc.lexical, current]};
            //
            // case "time":
            //
            //     return {...acc, time: [...acc.time, ...recognition[type]]};

            // case "task":
            //     return {...acc, task: [...acc.task, current]};

            // case "pointer":
            //     return {...acc, pointer: [...acc.pointer, current]};
            //
            // case "appendix":
            //     return {...acc, appendix: [...acc.appendix, current]};

            default:
                return {...acc, task: [...acc.task, ...recognition[type] ]};
        }

    }, constructed);

    console.log(a);
};