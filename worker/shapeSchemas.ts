import {
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultHorizontalAlignStyle,
  DefaultSizeStyle,
  DefaultVerticalAlignStyle,
  T,
  vecModelValidator,
} from 'tldraw';

export const buttonShapeProps = {
  w: T.number,
  h: T.number,
  size: DefaultSizeStyle,
  color: DefaultColorStyle,
  font: DefaultFontStyle,
  align: DefaultHorizontalAlignStyle,
  verticalAlign: DefaultVerticalAlignStyle,
  growY: T.positiveNumber,
  text: T.string,
};

export const speechBubbleShapeProps = {
  w: T.number,
  h: T.number,
  size: DefaultSizeStyle,
  color: DefaultColorStyle,
  font: DefaultFontStyle,
  align: DefaultHorizontalAlignStyle,
  verticalAlign: DefaultVerticalAlignStyle,
  growY: T.positiveNumber,
  text: T.string,
  tail: vecModelValidator,
};

export const customShapeSchemas = {
  button: { props: buttonShapeProps },
  'speech-bubble': { props: speechBubbleShapeProps },
};
