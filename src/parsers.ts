import {element, elements} from "./elements";
import {IRecognition, recognitions} from "./declarations";

export const getContext = (flow: string[], value: string, type: element): element[] => {
    const index = flow.indexOf(value);
    const a  =[-1,1]
        .map(operator => identifyElementType(flow[index + operator]))
        .filter(type => type)
        // .map(type => {
        //
        //     return Object
        //         .keys(recognitions[type])
        //         .filter(key => {
        //             recognitions[type][key].some(value => type)
        //         })
        //         .map(item => {
        //             console.log(item);
        //         })
        //         // .reduce((acc, current) => {
        //         //     return
        //         // })
        //         // .filter(element =>
        //         //     element.values.some(value => current.match(value)))
        // })

    // console.log(a);

    return a;
};

export const identifyElementType = (current: string): element => {

    if (!current) {
        return null;
    }
    console.log(elements);
    const a = elements
        .filter(element => {
            console.log(element.values);
            return element.values.some(value => current.match(value));
        })
        .reduce((acc, element) => {
            // console.log(element);
            return element.type
        }, "task" as element);

    // console.log(a);

    return a;
};

export const constructRecognition = (context: string, element: IRecognition) => {
    return Object.keys(element).reduce((acc, key) => {

        switch (key) {
            // case "month":
            //     return {...acc, month: [...acc.month, current]};
            //
            // case "day":
            //     return {...acc, day: [...acc.day, current]};
            //
            // case "lexical":
            //     return {...acc, lexical: [...acc.lexical, current]};
            //
            // case "time":
            //     return {...acc, time: [...acc.time, current]};
            //
            // case "task":
            //     return {...acc, task: [...acc.task, current]};

            // case "pointer":
            //     return {...acc, pointer: [...acc.pointer, current]};
            //
            // case "appendix":
            //     return {...acc, appendix: [...acc.appendix, current]};
        }

    });
};