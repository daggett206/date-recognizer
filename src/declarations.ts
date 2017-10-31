import {IElement} from "./elements";

export const months = {
    January : [/^(jan|january)$/gi, /^январ[ьяю]$/gi],
    February : [/^(feb|february)$/gi, /^феврал[ьяю]$/gi],
    March : [/^(mar|march)$/gi, /^мар(т|та|ту)$/gi],
    April : [/^(apr|april)$/gi, /^апрел[ьяю]$/gi],
    May : [/^may$/gi, /^ма[яю]$/gi],
    June : [/^(jun|june)$/gi, /^июн[ьяю]$/gi],
    July : [/^(jul|july)$/gi, /^июл[ьяю]$/gi],
    August : [/^(aug|august)$/gi, /^авгус(т|та|ту)$/gi],
    September : [/^(sep|september)$/gi, /^сентябр[ьяю]$/gi],
    October : [/^(oct|october)$/gi, /^октябр[ьяю]$/gi],
    November : [/^(nov|november)$/gi, /^ноябр[ьяю]$/gi],
    December : [/^(dec|december)$/gi, /^декабр[ьяю]$/gi],
};

export const days = {
    Monday : [/^(mon|monday)$/gi, /^(пон|пн|понедельник)$/gi],
    Tuesday : [/^(tue|tuesday)$/gi, /^(вт|вторник)$/gi],
    Wednesday : [/^(wed|wednesday)$/gi, /^ср(еда|еду)$/gi],
    Thursday : [/^(thu|thursday)$/gi, /^(чет|чт|четверг)$/gi],
    Friday : [/^(fri|friday)$/gi, /^(пят|пт|пятниц[ау])$/gi],
    Saturday : [/^(sat|saturday)$/gi, /^(суб|сб|суббот[ау])$/gi],
    Sunday : [/^(sun|sunday)$/gi, /^(вос|вс|воскр|воскресен[иь][ею])$/gi],
};

export const lexical = {
    Yesterday : [/^yesterday$/gi, /^вчера$/gi],
    Today : [/^today$/gi, /^сегодня$/gi],
    Tomorrow : [/^tomorrow$/gi, /^завтра$/gi],
    AfterTomorrow : [/^aftertomorrow$/gi, /^послезавтра$/gi],
};

export const time = {
    Day: [ /^([1-9]|[12][0-9]|3[01])$/g ],
    Full : [ /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/gi ],
    Hour : [ /^([0-1]?[0-9]|2[0-3])?$/gi ],
    Minutes : [ /^([0-5][0-9])?$/gi ],
};

export const pointer = {
    In: [/^in$/gi, /^через$/gi],
    To: [/^to$/gi, /^(к|в)$/gi],
    // On: [/^on$/gi, /^(на)$/gi],
};

export const appendix = {
    Hours: [/^hou(rs|r)$/gi, /^час(ов|а)$/gi],
    Minutes: [/^minut(es|e)$/gi, /^мину(т|ту)$/gi],
    Days: [/^da(y|ys)$/gi, /^дн(я|ей)$/gi],
};

export const action = {
    Remind: [/^remind$/gi, /^напомн(и|ить)$/gi],
};

export const task = {
    Any: [ /./g ]
};

export const recognitions = {
    months,
    days,
    lexical,
    time,
    pointer,
    appendix,
    action,
    task,
};

export const getDefaultRecognation = () => {
    return Object
        .keys(recognitions)
        .reduce((acc, key) => ({ ...acc, [key]: [] }), {});
};

export interface IRecognition {
    task?: IRecognitionItem[],
    lexical?: IRecognitionItem[],
    days?: IRecognitionItem[],
    months?: IRecognitionItem[],
    time?: IRecognitionItem[],
    pointer?: IRecognitionItem[],
    appendix?: IRecognitionItem[],
    action?: IRecognitionItem[],
}

export interface IRecognitionItem {
    element: IElement,
    value: string,
    context: IElement[]
}

export interface IRecognitionBuilder {
    recognition: IRecognition;
    text: string
}

export interface IConstructedRecognition {
    text: string;
    time: IElement[];
    date: IElement[];
    task: IElement[];
}
