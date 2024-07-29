import hexStringToBuffer from "./hex-string-to-buffer";

export default function parseSensorRf251(hexString: string, coefficient:number) {
  const buffer = hexStringToBuffer(hexString);

  if (buffer.length !== 14) {
    return {
      distance: null,
      temperature: null,
    };
  }

  // Извлекаем тетрады из первых 8 байтов для расстояния
  let distanceHex = '';
  for (let i = 7; i >= 0; i--) {
    distanceHex += (buffer[i] & 0x0F).toString(16);
  }

  // Преобразуем полученные тетрады в целое число
  let distanceValue = parseInt(distanceHex, 16);

  // Определяем знак и масштабируем значение
  if ((distanceValue & 0x80000000) !== 0) {
    distanceValue -= 0x100000000; // Если старший бит установлен, это отрицательное число
  }
  distanceValue *= 0.1; // Преобразуем в десятые доли микрона
  distanceValue = parseFloat(distanceValue.toFixed(2));

  // Извлекаем тетрады для температуры (байты 8, 9, 10 и 11)
  let temperatureHex = '';
  for (let i = 11; i >= 8; i--) {
    temperatureHex += (buffer[i] & 0x0F).toString(16);
  }

  // Преобразуем полученные тетрады в целое число
  let temperatureValue = parseInt(temperatureHex, 16);

  // Определяем знак и масштабируем значение
  if ((temperatureValue & 0x8000) !== 0) {
    temperatureValue -= 0x10000; // Если старший бит установлен, это отрицательное число
  }
  temperatureValue *= 0.1; // Преобразуем в десятые доли градуса
  // Округляем значение температуры до двух знаков после запятой
  temperatureValue = parseFloat(temperatureValue.toFixed(2));

  let addressHex = '';
  addressHex += (buffer[13] & 0x0F).toString(16); // Вторая тетрада из байта 13
  addressHex += (buffer[12] & 0x0F).toString(16); // Вторая тетрада из байта 12
  let address = parseInt(addressHex, 16); // Преобразуем шестнадцатеричное значение в десятичное

  if (isNaN(distanceValue)) {
    return {
      distance: null,
      temperature: null,
    };
  } else {
    return {
      distance: distanceValue*coefficient,
      temperature: temperatureValue*coefficient,
    };
  }
}
