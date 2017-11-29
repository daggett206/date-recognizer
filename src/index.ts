import {constructRecognition, recognize, resolveRecognition} from "./core";
import {pipe} from "./utils";
import {IRecognizerProps} from "./declarations";

const recognizer = (input: string, props: IRecognizerProps) => pipe(
    input => recognize(input, props),
    resolveRecognition,
    constructRecognition,
)(input, props);


recognizer("завтра в 21 30 выключить Дом2", {
    now: '2011-09-26T13:28:27.672Z'
}); /*?*/

export default recognizer;