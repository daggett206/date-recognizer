const cases                                                 = require('jest-in-case');
const {constructRecognition, recognize, resolveRecognition} = require('../src/core');
const {pipe}                                                = require('../src/utils');
const moment                                                = require('moment');

const testReadyRecognizer = (input, now) => {
    return pipe(
        input => recognize(input, now),
        resolveRecognition,
        constructRecognition
    )(input, now);

}

const INIT_DATE = moment('2017-11-23T16:59:01.261Z').seconds(0).millisecond(0).toISOString();

describe('[Pointer Cases]', () => {
    cases(
        "In",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'year',
                input   : 'через 3 года купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'year').toDate(),
                    task: "купить лампу"
                }
            },
            {
                name    : 'months',
                input   : 'через 3 месяца купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'months').toDate(),
                    task: "купить лампу"
                }
            },
            {
                name    : 'days',
                input   : 'через 3 дня купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'days').toDate(),
                    task: "купить лампу"
                }
            },
            {
                name    : 'hours',
                input   : 'через 3 часа купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'hours').toDate(),
                    task: "купить лампу"
                }
            },
            {
                name    : 'minutes',
                input   : 'через 3 минуты купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'minutes').toDate(),
                    task: "купить лампу"
                }
            },
        ]
    )

    cases(
        "To",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'full',
                input   : 'завтра в 21:30 выключить Дом2',
                expected: {
                    date: moment(INIT_DATE).add(1, "day").hour(21).minutes(30).toDate(),
                    task: "выключить Дом2"
                }
            },
            {
                name    : 'hours',
                input   : 'в 3 часа купить лампу',
                expected: {
                    date: moment(INIT_DATE).hours(3).minutes(0).toDate(),
                    task: "купить лампу"
                }
            },
            {
                name    : 'minutes',
                input   : 'через 3 минуты купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'minutes').toDate(),
                    task: "купить лампу"
                }
            },
        ]
    )
});

describe('[Lexical Cases]', () => {
    cases(
        "Yesterday",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'вчера подарить подарок',
                input   : 'вчера подарить подарок',
                expected: {
                    date: moment(INIT_DATE).add(-1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить вчера подарок',
                input   : 'подарить вчера подарок',
                expected: {
                    date: moment(INIT_DATE).add(-1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить подарок вчера',
                input   : 'подарить подарок вчера',
                expected: {
                    date: moment(INIT_DATE).add(-1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'yesterday send a gift',
                input   : 'yesterday send a gift',
                expected: {
                    date: moment(INIT_DATE).add(-1, 'day').toDate(),
                    task: "send a gift"
                }
            },
            {
                name    : 'send a gift yesterday',
                input   : 'send a gift yesterday',
                expected: {
                    date: moment(INIT_DATE).add(-1, 'day').toDate(),
                    task: "send a gift"
                }
            },
        ]
    )
    cases(
        "Today",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'сегодня подарить подарок',
                input   : 'сегодня подарить подарок',
                expected: {
                    date: moment(INIT_DATE).add(0, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить сегодня подарок',
                input   : 'подарить сегодня подарок',
                expected: {
                    date: moment(INIT_DATE).add(0, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить подарок сегодня',
                input   : 'подарить подарок сегодня',
                expected: {
                    date: moment(INIT_DATE).add(0, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'today send a gift',
                input   : 'today send a gift',
                expected: {
                    date: moment(INIT_DATE).add(0, 'day').toDate(),
                    task: "send a gift"
                }
            },
            {
                name    : 'send a gift today',
                input   : 'send a gift today',
                expected: {
                    date: moment(INIT_DATE).add(0, 'day').toDate(),
                    task: "send a gift"
                }
            },
        ]
    )
    cases(
        "Tomorrow",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'завтра подарить подарок',
                input   : 'завтра подарить подарок',
                expected: {
                    date: moment(INIT_DATE).add(1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить завтра подарок',
                input   : 'подарить завтра подарок',
                expected: {
                    date: moment(INIT_DATE).add(1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить подарок завтра',
                input   : 'подарить подарок завтра',
                expected: {
                    date: moment(INIT_DATE).add(1, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'tomorrow send a gift',
                input   : 'tomorrow send a gift',
                expected: {
                    date: moment(INIT_DATE).add(1, 'day').toDate(),
                    task: "send a gift"
                }
            },
            {
                name    : 'send a gift tomorrow',
                input   : 'send a gift tomorrow',
                expected: {
                    date: moment(INIT_DATE).add(1, 'day').toDate(),
                    task: "send a gift"
                }
            },
        ]
    )
    cases(
        "AfterTomorrow",
        ({input, expected}) => expect(testReadyRecognizer(input, {now: INIT_DATE})).toMatchObject(expected),
        [
            {
                name    : 'послезавтра подарить подарок',
                input   : 'послезавтра подарить подарок',
                expected: {
                    date: moment(INIT_DATE).add(2, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить послезавтра подарок',
                input   : 'подарить послезавтра подарок',
                expected: {
                    date: moment(INIT_DATE).add(2, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'подарить подарок послезавтра',
                input   : 'подарить подарок послезавтра',
                expected: {
                    date: moment(INIT_DATE).add(2, 'day').toDate(),
                    task: "подарить подарок"
                }
            },
            {
                name    : 'aftertomorrow send a gift',
                input   : 'aftertomorrow send a gift',
                expected: {
                    date: moment(INIT_DATE).add(2, 'day').toDate(),
                    task: "send a gift"
                }
            },
            {
                name    : 'send a gift aftertomorrow',
                input   : 'send a gift aftertomorrow',
                expected: {
                    date: moment(INIT_DATE).add(2, 'day').toDate(),
                    task: "send a gift"
                }
            },
        ]
    )
});

//TODO см. кейсы ниже
// "Проснуться в понедельник в ванной 2 января в 12"
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