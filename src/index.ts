import {constructRecognition, recognize, resolveRecognition} from "./core";
import {pipe} from "./utils";
const recognizer = (input: string) => pipe(
    recognize,
    resolveRecognition,
    constructRecognition
)(input);

export default recognizer;