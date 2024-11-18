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

export type GLSLType =
  | 'float'
  | 'int'
  | 'bool'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'sampler2D'
  | 'mat4'
  | 'vec3[4]';

export type UniformMetadata = {
  [key: string]:
    | string
    | number
    | boolean
    | object
    | Record<string, string | number | boolean | object>[];
};

export type UniformDescription = {
  type: GLSLType;
  name: string;
  metadata: UniformMetadata;
};

const UDMetadata: T.ObjectValidator<UniformMetadata> = T.object({}).allowUnknownProperties();

const UD: T.ObjectValidator<UniformDescription> = T.object({
  name: T.string,
  type: T.string as T.Validator<GLSLType>,
  metadata: UDMetadata,
});

const shaderShapeProps = {
  w: T.number,
  h: T.number,
  fragmentShader: T.string.optional(),
  optimizeImages: T.boolean,
  uniformDescriptions: T.arrayOf(UD),
};

export const customShapeSchemas = {
  shader: { props: shaderShapeProps },
  button: { props: buttonShapeProps },
  'speech-bubble': { props: speechBubbleShapeProps },
  'radix-button': { props: radixButtonShapeProps },
};
