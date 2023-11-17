import type { IntRange } from "./IntRange";

type Pixel = [number, number, IntRange<0, 3>]; // [x, y, Farbcode]

export type PixelsMsg = {
  data: Pixel[];
};

export type AllPixelsMsg = {
  data: string; 
};

export type PixelRowMsg = {
  row: IntRange<0, 63>; // Should be a number between 0 and 63
  data: string; //128px
};

export type PixelColMsg = {
  col: IntRange<0, 127>; // Should be a number between 0 and 127
  data: string; //128px
};

export type PixelAreaMsg = {
  fx: number; // links obere Ecke X (inklusiv)
  fy: number; // links obere Ecke Y (inklusiv)
  lx: number; // rechts untere Ecke X (inklusiv)
  ly: number; // rechts untere Ecke Y (inklusiv)
  data: string;
};
