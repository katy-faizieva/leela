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

// Стрелы: основание → наконечник (движение вверх)
export const ARROWS: Record<number, number> = {
  54: 68,
  46: 62,
  45: 67,
  37: 66,
  28: 50,
  27: 41,
  22: 60,
  20: 32,
  17: 69,
  10: 23,
};

export const BOARD_SIZE = 72;
export const FINAL_CELL = 68;
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

// Нумерация "змейкой" снизу вверх:
// Нечётные ряды снизу (1-й: 1–9, 3-й: 19–27, 5-й: 37–45, 7-й: 55–63) -> слева направо
// Чётные ряды снизу (2-й: 10–18, 4-й: 28–36, 6-й: 46–54, 8-й: 64–72) -> справа налево
export function getCellPosition(cellNumber: number): { row: number; col: number } {
  if (cellNumber < 1 || cellNumber > BOARD_SIZE) return { row: 0, col: 0 };
  const zeroIndex = cellNumber - 1;
  const rowFromBottom = Math.floor(zeroIndex / COLS);
  const posInRow = zeroIndex % COLS;
  const row = ROWS - 1 - rowFromBottom;
  const col = rowFromBottom % 2 === 0 ? posInRow : COLS - 1 - posInRow;
  return { row, col };
}

export const BOARD_IMAGE = { width: 2048, height: 1536 };
export const GRID_X = [107, 311, 512, 717, 921.5, 1126, 1331, 1537.5, 1741, 1941.5];
export const GRID_Y = [134, 299, 468.5, 632, 794, 956, 1122, 1285, 1442];

export function getCellBounds(cellNumber: number) {
  const { row, col } = getCellPosition(cellNumber);
  return {
    left: (GRID_X[col] / BOARD_IMAGE.width) * 100,
    top: (GRID_Y[row] / BOARD_IMAGE.height) * 100,
    width: ((GRID_X[col + 1] - GRID_X[col]) / BOARD_IMAGE.width) * 100,
    height: ((GRID_Y[row + 1] - GRID_Y[row]) / BOARD_IMAGE.height) * 100,
  };
}

export function getCellCenter(cellNumber: number): { x: number; y: number } {
  const bounds = getCellBounds(cellNumber);
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
}

// Единая математическая функция расчёта хода строго после остановки фишки
export function resolveMove(
  fromCell: number,
  roll: number,
  bounceOnOvershoot: boolean
): { landedCell: number; finalCell: number; transitionType: string | null } {
  let landedCell = fromCell === 0 ? roll : fromCell + roll;

  // Перелёт за пределы 72-й клетки
  if (landedCell > BOARD_SIZE) {
    if (bounceOnOvershoot) {
      landedCell = BOARD_SIZE - (landedCell - BOARD_SIZE);
    } else {
      landedCell = fromCell;
    }
  }

  // Проверка срабатывания происходит ОДИН РАЗ строго на клетке остановки (landedCell)
  if (Object.prototype.hasOwnProperty.call(SNAKES, landedCell)) {
    const tail = SNAKES[landedCell];
    return {
      landedCell,
      finalCell: tail,
      transitionType: `Змея: ${landedCell} → ${tail}`,
    };
  }

  if (Object.prototype.hasOwnProperty.call(ARROWS, landedCell)) {
    const tip = ARROWS[landedCell];
    return {
      landedCell,
      finalCell: tip,
      transitionType: `Стрела: ${landedCell} → ${tip}`,
    };
  }

  return {
    landedCell,
    finalCell: landedCell,
    transitionType: null,
  };
}
