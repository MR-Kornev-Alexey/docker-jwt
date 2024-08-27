export default  function hexToAsciiAndConvert(sequence: string, coefficient:number):  number  {
  // 1. Извлекаем интересующую нас часть строки: с 10 по 19 символы.
  const hexSegment = sequence.slice(10, 20);
  // 2. Преобразуем HEX в ASCII.
  let asciiStr = '';
  for (let i = 0; i < hexSegment.length; i += 2) {
    const hexPair = hexSegment.slice(i, i + 2);
    const asciiChar = String.fromCharCode(parseInt(hexPair, 16));
    asciiStr += asciiChar;
  }

  // 3. Преобразуем полученную строку в целое и дробное число.
  const integerPart = parseInt(asciiStr.slice(0, 4), 10); // Первые четыре символа - целое число
  const fractionalPart = parseInt(asciiStr.slice(4), 10); // Последний символ - десятичная дробь
  return (integerPart + fractionalPart/10)*coefficient
}
