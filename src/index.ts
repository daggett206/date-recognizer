import {IConstructedRecognition, IRecognitionBuilder, IResolvedRecognition} from "./declarations";
import {constructRecognition, recognize, resolveRecognition} from "./core";

const resolve = (builder: IRecognitionBuilder): IResolvedRecognition => {
    return resolveRecognition(builder);
};

const construct = (resolved: IResolvedRecognition): IConstructedRecognition => {
    return constructRecognition(resolved);
};

recognize("Сегодня в 21 выключить Дом2")
    .then(resolve)
    .then(construct)
    .then(r => console.log(r))

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
