import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import * as net from 'net';

@Injectable()
export class SocketClientService {
sendRequest(ip: string, port: number, code: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const hexValues = code.split(' ').map(hex => parseInt(hex, 16));
      const request = Buffer.from(hexValues);
      // const request1 = Buffer.from([0x7E, 0x9B, 0x01, 0x02, 0x98, 0x7E]);
      const client = new net.Socket();

      client.connect(port, ip, () => {
        console.log( new Date());
        console.log('Connected to server:', request);
        client.write(request);
      });

      client.on('data', (data: Buffer) => {
        console.log('Received response from server:', data);
        //TODO провалидировать, что приходит
        // всегда делать копию буфера, который пришёл
        const copyOfData = Buffer.allocUnsafe(100);
        data.copy(copyOfData);
        client.end();
        resolve(copyOfData);
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
