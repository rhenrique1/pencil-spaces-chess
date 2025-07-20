export const PlayerColor = {
  WHITE: 'white',
  BLACK: 'black',
} as const;

export type PlayerColorType = (typeof PlayerColor)[keyof typeof PlayerColor];
