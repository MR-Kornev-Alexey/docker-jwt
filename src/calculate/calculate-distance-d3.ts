export const calculateDistance = (x: number, y: number): number | null => {
  // Проверка на undefined
  if (x === undefined || y === undefined) {
    return null;
  }

  // Вычисление расстояния
  let seriesDistance = Math.sqrt(x * x + y * y);

  // Округление до 2 знаков после запятой
  seriesDistance = parseFloat(seriesDistance.toFixed(2));

  // Проверка на NaN
  if (isNaN(seriesDistance)) {
    return null;
  } else {
    return seriesDistance;
  }
};
