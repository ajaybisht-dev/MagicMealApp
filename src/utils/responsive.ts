import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;

const normalize = (size: any, based = 'width') => {
  const scale = based === 'height' ? scaleHeight : scaleWidth;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

const widthPixel = (size: any) => normalize(size, 'width');

const heightPixel = (size: any) => normalize(size, 'height');

const fontPixel = (size: any) => {
  const averageScale = (scaleWidth + scaleHeight) / 2;
  return Math.round(PixelRatio.roundToNearestPixel(size * averageScale));
};

const pixelSizeVertical = (size: any) => heightPixel(size);

const pixelSizeHorizontal = (size: any) => widthPixel(size);

export {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
};