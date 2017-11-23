const cases = require('jest-in-case');
const {constructRecognition, recognize, resolveRecognition} = require('../src/core');
const {pipe} = require('../src/utils');
const moment = require('moment');

const testReadyRecognizer = (input, fromDate) => pipe(
    input => recognize(input, fromDate),
    resolveRecognition,
    constructRecognition
)(input);


/*
* Создаем изначальную дату для устойчивости тестов. Константу можно задать в любом месте
* */

const INIT_DATE = moment('2017-11-23T16:59:01.261Z').seconds(0).millisecond(0).toISOString();
describe('Кейсы с текущим днем', () => {
    cases(
        "позитивные",
        ({input, expected}) => expect(testReadyRecognizer(input, INIT_DATE)).toMatchObject(expected),
        [
            {
                input: 'через 3 часа купить лампу',
                expected: {
                    date: moment(INIT_DATE).add(3, 'hours').toDate(),
                    task: "купить лампу"
                }
            },
            {
                input: 'Получить письмо в 18',
                expected: {
                    date: moment(INIT_DATE).hours(18).minutes(0).toDate(),
                    task: "Получить письмо"
                }
            },
            {
                input: 'Через 10 дней купить подарки Жене на Новый год в 12:30 напомнить',
                expected: {
                    date: moment(INIT_DATE).add(10, 'days').hours(12).minutes(30).toDate(),
                    task: "купить подарки Жене на Новый год"
                }
            }
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