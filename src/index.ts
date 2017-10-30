import {identifyElementType, constructRecognition, getContext} from "./parsers";
import {IRecognition, IRecognitionBuilder} from "./declarations";

const recognize = (text: string): Promise<IRecognitionBuilder> => {

   const defaultRec: IRecognition = {
       task: [],
       lexical: [],
       day: [],
       month: [],
       time: [],
       pointer: [],
       appendix: [],
       action: [],
   };

    const flow = text.split(' ');

    const recognition = flow.map((value: string) => {
        const type = identifyElementType(value);
        // return {type, value, context: getContext(flow, value, type)};
    });
    //     .reduce((acc, current) => {
    //
    //     switch (identifyElement(current.toLowerCase())) {
    //         case "month":
    //             return {...acc, month: [...acc.month, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "day":
    //             return {...acc, day: [...acc.day, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "lexical":
    //             return {...acc, lexical: [...acc.lexical, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "time":
    //             return {...acc, time: [...acc.time, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "task":
    //             return {...acc, task: [...acc.task, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "pointer":
    //             return {...acc, pointer: [...acc.pointer, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "appendix":
    //             return {...acc, appendix: [...acc.appendix, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //
    //         case "action":
    //             return {...acc, action: [...acc.action, {value: current, context: identifyElement(flow[flow.indexOf(current) + 1]) }]};
    //     }
    // }, defaultRec);

    // console.log(recognition);

    return Promise.resolve({recognition, text});
};

const construct = (builder: IRecognitionBuilder) => {

    const filtered = Object
        .keys(builder.recognition)
        .filter(key => builder.recognition[key].length)
        .map(key => ({[key]: builder.recognition[key]}))
        // .reduce((acc, element: IRecognition) => {
        //
        //     return { ...acc, ...constructRecognition(builder.context, element) };
        //
        // });

    console.log(filtered);
};

recognize("Через 10 дней купить")
    // .then(e => console.log(e))
    // .then(construct);

// Через 10 дней купить подарки Жене на Новый год в 12:30 напомнить
// Мыть машину через 2 дня в 11"
// Поздравить с ДР через год в 12:30"
// Записаться на пятницу"
// Проснуться 2 января
// Через 50 лет купить котедж"
// Сегодня в 16 позвонить жене"
// Через пять дней в 14:00"
// Поздравить всех с НГ 31 декабря в 23"
// Получить письмо в 18"
// Послезавтра в 11 приехать за зарплатой"
// Сегодня в 21часов 30 минут выключить Дом2 "
// Купить браслет Jawbone Up через 2 дня в 20:00"
// Напомнить сделать рефакторинг в субботу"
// Перезагрузить сервер в воскресение в 2