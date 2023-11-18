export type Pixel = [number, number, number]; // [x, y, Farbcode]

export type PixelsMsg = {
  data: Pixel[];
};

export type AllPixelsMsg = {
  data: string; 
};

export type PixelRowMsg = {
  row: number; // Should be a number between 0 and 63
  data: string; //128px
};

export type PixelColMsg = {
  col: number; // Should be a number between 0 and 127
  data: string; //128px
};

export type PixelAreaMsg = {
  fx: number; // links obere Ecke X (inklusiv)
  fy: number; // links obere Ecke Y (inklusiv)
  lx: number; // rechts untere Ecke X (inklusiv)
  ly: number; // rechts untere Ecke Y (inklusiv)
  data: string;
};
