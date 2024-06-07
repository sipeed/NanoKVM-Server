export type ScreenSize = {
  width: number;
  height: number;
};

export type KeyboardEvent = {
  type: 'keydown' | 'keyup';
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};
