import {
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultHorizontalAlignStyle,
  DefaultSizeStyle,
  DefaultVerticalAlignStyle,
  StyleProp,
  T,
  vecModelValidator,
} from 'tldraw';

export const buttonShapeProps = {
  w: T.number,
  h: T.number,
  size: DefaultSizeStyle,
  color: DefaultColorStyle,
  font: DefaultFontStyle,
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

export const DefaultRadixVariantStyle = StyleProp.defineEnum('hatch:radix-variant', {
  defaultValue: 'solid',
  values: ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost'],
});

export const DefaultRadixSizeStyle = StyleProp.defineEnum('hatch:radix-size', {
  defaultValue: '2',
  values: ['1', '2', '3', '4'],
});

export const DefaultRadixRadiusStyle = StyleProp.defineEnum('hatch:radix-radius', {
  defaultValue: 'medium',
  values: ['none', 'small', 'medium', 'large', 'full'],
});

export const DefaultRadixFontFamilyStyle = StyleProp.define('hatch:radix-font-family', {
  defaultValue: 'inter',
  type: T.string,
});

export const DefaultRadixColorStyle = StyleProp.define('hatch:radix-color', {
  defaultValue: 'blue',
  type: T.string,
});

const radixButtonShapeProps = {
  w: T.number,
  h: T.number,
  size: DefaultRadixSizeStyle,
  color: DefaultRadixColorStyle,
  fontFamily: DefaultRadixFontFamilyStyle,
  variant: DefaultRadixVariantStyle,
  radius: DefaultRadixRadiusStyle,
  highContrast: T.boolean,
  text: T.string,
};

export const customShapeSchemas = {
  button: { props: buttonShapeProps },
  'speech-bubble': { props: speechBubbleShapeProps },
  'radix-button': { props: radixButtonShapeProps },
};
