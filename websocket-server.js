const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Обработка входящих сообщений от клиента
  ws.on('message', (message) => {
    console.log('Received message:', message);

    // Отправка ответа клиенту
    ws.send('Received your message: ' + message);
  });

  // Обработка закрытия соединения клиентом
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
