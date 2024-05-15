import { Injectable } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class SocketClientService {
  // private readonly IP = '192.168.8.101';
  // private readonly PORT = 5000;
  private readonly request1 = Buffer.from([0x7E, 0x9B, 0x01, 0x02, 0x98, 0x7E]);
sendRequest(ip: string, port: number, code: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const hexValues = code.split(' ').map(hex => parseInt(hex, 16));
      const request = Buffer.from(hexValues);
      // const request1 = Buffer.from([0x7E, 0x9B, 0x01, 0x02, 0x98, 0x7E]);
      const client = new net.Socket();

      client.connect(port, ip, () => {
        console.log('Connected to server:', request);
        client.write(request);
      });

      client.on('data', (data: Buffer) => {
        console.log('Received response from server:', data);
        client.end();
        resolve(data);
      });
      // Обработка закрытия соединения
      client.on('close', () => {
        console.log('Соединение закрыто');
      });

      client.on('error', (err: Error) => {
        console.error('Error:', err);
        client.destroy();
        reject(err);
      });
    });
  }

}
