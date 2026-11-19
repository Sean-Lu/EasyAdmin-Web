/** 支持成绩记录与同步的关卡游戏；新增游戏只改这里，类型与运行时校验自动同步 */
export const PUZZLE_GAMES = ["nonogram", "lightUp", "slitherlink", "game2048", "maze", "guessNumber"] as const;

export type PuzzleGame = (typeof PUZZLE_GAMES)[number];
