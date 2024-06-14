const net = require('net');

// IP адрес и порт вашего датчика
const IP = '192.168.8.101';
const PORT = 5000;

console.log('start');
// Запрос
const request = Buffer.from([0x7E, 0x9B, 0x01, 0x03, 0x99, 0x7E]);
const request1 = Buffer.from([0x03, 0x86]);
// const request = Buffer.from([0x7E, 0x9B, 0x01, 0x01, 0x9B, 0x7E]);

// Создаем функцию для отправки запроса
function sendRequest() {
    // Создаем новое подключение TCP
    const client = new net.Socket();

    // Подключаемся к серверу
    client.connect(PORT, IP, () => {
        console.log('Подключено к серверу', request);
        // Отправляем запрос
        client.write(request);
    });

    // Обработка ответа от сервера
    client.on('data', (data) => {
        console.log('Получен ответ от сервера:', data);
        // Добавьте здесь код обработки ответа
        // Например, распаковка данных и анализ ответа
        // После обработки ответа, закройте соединение
        client.end();
    });


    // Обработка ошибок
    client.on('error', (err) => {
        console.error('Ошибка:', err);
    });

    // Обработка закрытия соединения
    client.on('close', () => {
        console.log('Соединение закрыто');
    });
}
function sendRequest1() {
    // Создаем новое подключение TCP
    const client = new net.Socket();

    // Подключаемся к серверу
    client.connect(PORT, IP, () => {
        console.log('Подключено к серверу', request1);
        // Отправляем запрос
        client.write(request1);
    });

    // Обработка ответа от сервера
    client.on('data', (data) => {
        console.log('Получен ответ от сервера:', data);
        // Добавьте здесь код обработки ответа
        // Например, распаковка данных и анализ ответа
        // После обработки ответа, закройте соединение
        client.end();
    });


    // Обработка ошибок
    client.on('error', (err) => {
        console.error('Ошибка:', err);
    });

    // Обработка закрытия соединения
    client.on('close', () => {
        console.log('Соединение закрыто');
    });
}

// Отправляем запрос каждые 10 секунд
setInterval(sendRequest, 10000);
// setInterval(sendRequest1, 5000);
