import {elements, IElement} from "./elements";

export const getContext = (flow: string[], value: string): IElement[] => {
    const index = flow.indexOf(value);

    return [-1,1]
        .filter(operator => flow[index + operator])
        .map(operator => identifyElement(flow[index + operator]));
};

export const identifyElement = (current: string): IElement => {

    if (!current) {
        return null;
    }

    return elements
        .filter(element =>
            element.values.some(item =>
                item.value.some(value =>
                    current.match(value))))
        .map(element => ({
            type: element.type,
            key: element.values
                .filter(item => item.value.some(value => current.match(value)))
                .reduce((acc, element) => element.key, "")
        }))
        .reduce((acc, element) => element, {});
};

// export const constructRecognition = (context: string, element: IRecognition) => {
//     return Object.keys(element).reduce((acc, key) => {
//
//         switch (key) {
//             // case "month":
//             //     return {...acc, month: [...acc.month, current]};
//             //
//             // case "day":
//             //     return {...acc, day: [...acc.day, current]};
//             //
//             // case "lexical":
//             //     return {...acc, lexical: [...acc.lexical, current]};
//             //
//             // case "time":
//             //     return {...acc, time: [...acc.time, current]};
//             //
//             // case "task":
//             //     return {...acc, task: [...acc.task, current]};
//
//             // case "pointer":
//             //     return {...acc, pointer: [...acc.pointer, current]};
//             //
//             // case "appendix":
//             //     return {...acc, appendix: [...acc.appendix, current]};
//         }
//
//     });
// };