import {IElement} from "./elements";

export enum MonthsProps {
    January,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December,
}
export const months = {
    [MonthsProps.January] : [/^(jan|january)$/gi, /^январ[ьяю]$/gi],
    [MonthsProps.February] : [/^(feb|february)$/gi, /^феврал[ьяю]$/gi],
    [MonthsProps.March] : [/^(mar|march)$/gi, /^мар(т|та|ту)$/gi],
    [MonthsProps.April] : [/^(apr|april)$/gi, /^апрел[ьяю]$/gi],
    [MonthsProps.May] : [/^may$/gi, /^ма[яю]$/gi],
    [MonthsProps.June] : [/^(jun|june)$/gi, /^июн[ьяю]$/gi],
    [MonthsProps.July] : [/^(jul|july)$/gi, /^июл[ьяю]$/gi],
    [MonthsProps.August] : [/^(aug|august)$/gi, /^авгус(т|та|ту)$/gi],
    [MonthsProps.September] : [/^(sep|september)$/gi, /^сентябр[ьяю]$/gi],
    [MonthsProps.October] : [/^(oct|october)$/gi, /^октябр[ьяю]$/gi],
    [MonthsProps.November] : [/^(nov|november)$/gi, /^ноябр[ьяю]$/gi],
    [MonthsProps.December] : [/^(dec|december)$/gi, /^декабр[ьяю]$/gi],
};

export enum DaysProps {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}
export const days = {
    [DaysProps.Sunday] : [/^(sun|sunday)$/gi, /^(вос|вс|воскр|воскресен[иь][ею])$/gi],
    [DaysProps.Monday] : [/^(mon|monday)$/gi, /^(пон|пн|понедельник)$/gi],
    [DaysProps.Tuesday] : [/^(tue|tuesday)$/gi, /^(вт|вторник)$/gi],
    [DaysProps.Wednesday] : [/^(wed|wednesday)$/gi, /^ср(еда|еду)$/gi],
    [DaysProps.Thursday] : [/^(thu|thursday)$/gi, /^(чет|чт|четверг)$/gi],
    [DaysProps.Friday] : [/^(fri|friday)$/gi, /^(пят|пт|пятниц[ау])$/gi],
    [DaysProps.Saturday] : [/^(sat|saturday)$/gi, /^(суб|сб|суббот[ау])$/gi],
};

export enum LexicalProps {
    Yesterday = -1,
    Today,
    Tomorrow,
    AfterTomorrow,
}
export const lexical = {
    [LexicalProps.Yesterday] : [/^yesterday$/gi, /^вчера$/gi],
    [LexicalProps.Today] : [/^today$/gi, /^сегодня$/gi],
    [LexicalProps.Tomorrow] : [/^tomorrow$/gi, /^завтра$/gi],
    [LexicalProps.AfterTomorrow] : [/^aftertomorrow$/gi, /^послезавтра$/gi],
};

export enum TimeProps {
    Day,
    Full,
    Hour,
    Minutes,
}
export const time = {
    [TimeProps.Day]: [ /^([1-9]|[12][0-9]|3[01])$/g ],
    [TimeProps.Full ]: [ /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/gi ],
    [TimeProps.Hour ]: [ /^([0-1]?[0-9]|2[0-3])?$/gi ],
    [TimeProps.Minutes ]: [ /^([0-5][0-9])?$/gi ],
};

export enum PointerProps {
    In,
    To
}
export const pointer = {
    [PointerProps.In]: [/^in$/gi, /^через$/gi],
    [PointerProps.To]: [/^(to|at)$/gi, /^[кв]$/gi],
    // On: [/^on$/gi, /^(на)$/gi],
};

export enum AppendixProps {
    Minutes,
    Hours,
    Days,
    Months,
    Years,
}
export const appendix = {
    [AppendixProps.Minutes]: [/^minut(es|e)$/gi, /^ми(н|н.|нут|нуту|нуты)$/gi],
    [AppendixProps.Hours]: [/^hou(rs|r)$/gi, /^ча(с|сов|са)$/gi],
    [AppendixProps.Days]: [/^da(y|ys)$/gi, /^д(ень|ня|ней)$/gi],
    [AppendixProps.Months]: [/^month(s)$/gi, /^ме(с|с.|сяц|сяца|сяцев)$/gi],
    [AppendixProps.Years]: [/^yea(r|rs)$/gi, /^лет|год(а)$/gi],
};

export enum ActionProps {
    Remind,
}
export const action = {
    [ActionProps.Remind]: [/^remind$/gi, /^напомн(и|ить)$/gi],
};

export enum TaskProps {
    Any,
}
export const task = {
    [TaskProps.Any]: [ /./g ]
};

// TODO Add year
// TODO Add hour
// TODO Add minutes

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
    task: IRecognitionItem[],
    lexical: IRecognitionItem[],
    days: IRecognitionItem[],
    months: IRecognitionItem[],
    time: IRecognitionItem[],
    pointer: IRecognitionItem[],
    appendix: IRecognitionItem[],
    action: IRecognitionItem[],
}

export interface IRecognitionItem {
    element: IElement,
    value: string,
    context: IElement[]
}

export interface IRecognitionBuilder {
    recognition: IRecognition;
    text: string;
    now: string; // ISO string;
}

export interface IResolvedRecognition {
    text: string;
    time: IElement[];
    date: IElement[];
    task: IElement[];
}

export interface IConstructedRecognition {
    text: string;
    task: string;
    date: Date;
    remind?: Date;
}

export interface IRecognizerProps {
    now: string; // ISO string
}