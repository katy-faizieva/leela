// Змеи: голова → хвост (движение вниз)
export const SNAKES: Record<number, number> = {
  72: 51,
  63: 2,
  61: 13,
  55: 3,
  52: 35,
  44: 9,
  29: 6,
  24: 7,
  16: 4,
  12: 8,
};

// Стрелы: начало → остриё (движение вверх)
export const ARROWS: Record<number, number> = {
  10: 23,
  17: 69,
  20: 32,
  22: 60,
  27: 41,
  28: 50,
  37: 66,
  45: 67,
  46: 62,
  54: 68,
};

export const BOARD_SIZE = 72;
export const FINAL_CELL = 72;
export const COLS = 9;
export const ROWS = 8;

// Цвета фишек
export const PLAYER_COLORS = [
  '#FFE4A3', // тёплый свет
  '#67E99B', // зелёный свет
  '#C5A3FF', // лавандовый свет
  '#FF9B4A', // оранжевый свет
];

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
  extraRollOnSix: true,
  bounceOnOvershoot: false, // false = стоять, true = отскок
};

// Получить координаты центра клетки (в процентах) для наложения фишки
// Нумерация "змейкой" снизу вверх
export function getCellPosition(cellNumber: number): { row: number; col: number } {
  if (cellNumber < 1 || cellNumber > BOARD_SIZE) return { row: 0, col: 0 };
  const zeroIndex = cellNumber - 1;
  const rowFromBottom = Math.floor(zeroIndex / COLS);
  const posInRow = zeroIndex % COLS;
  const row = ROWS - 1 - rowFromBottom; // row 0 = верх
  // Чётные ряды (0,2,4,6 снизу) идут слева направо, нечётные — справа налево
  const col = rowFromBottom % 2 === 0 ? posInRow : COLS - 1 - posInRow;
  return { row, col };
}

// Границы линий сетки в исходном изображении 2048 × 1536.
// Изображение не меняется: координаты слоя учитывают заголовок и рамку.
export const BOARD_IMAGE = { width: 2048, height: 1536 };
export const GRID_X = [107, 311, 512, 717, 921.5, 1126, 1331, 1537.5, 1741, 1941.5];
export const GRID_Y = [134, 299, 468.5, 632, 794, 956, 1122, 1285, 1442];

export function getCellBounds(cellNumber: number) {
  const { row, col } = getCellPosition(cellNumber);
  return {
    left: GRID_X[col] / BOARD_IMAGE.width * 100,
    top: GRID_Y[row] / BOARD_IMAGE.height * 100,
    width: (GRID_X[col + 1] - GRID_X[col]) / BOARD_IMAGE.width * 100,
    height: (GRID_Y[row + 1] - GRID_Y[row]) / BOARD_IMAGE.height * 100,
  };
}

export function getCellCenter(cellNumber: number): { x: number; y: number } {
  const bounds = getCellBounds(cellNumber);
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
}
