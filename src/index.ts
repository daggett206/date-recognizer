import {constructRecognition, getContext, identifyElement} from "./helpers";
import {IRecognitionBuilder} from "./declarations";

const recognize = (text: string): Promise<IRecognitionBuilder> => {

    const flow = text.split(' ');
    const recognition = flow
        .map((value: string) => {
            const element = identifyElement(value);
            return {element, value, context: getContext(flow, value)};
        })
        .reduce((acc, current) => {
            return {
                ...acc,
                [current.element.type]: !!acc[current.element.type]
                    ? [...acc[current.element.type], current]
                    : [current]
            };

        }, {});

    return Promise.resolve({recognition, text});
};

const construct = (builder: IRecognitionBuilder) => {

    return constructRecognition(builder);
};

recognize("Проснуться 2 января в пятницу завтра через день")
    .then(construct)
    // .then(e => console.log(e))

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