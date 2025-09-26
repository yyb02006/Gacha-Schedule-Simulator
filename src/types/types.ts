export type GachaType = 'limited' | 'standard' | 'collab';

export type GachaTypeButtonLabel = '한정' | '일반' | '콜라보';

export type GachaTypeButtonCustom = {
  state: 'initial' | 'normal';
  hoverBackground: string;
  isActive: boolean;
};

export type GachaTypeButton = {
  name: GachaTypeButtonLabel;
  type: GachaType;
  hoverBackground: string;
};

export type SizeClass = `size-[${number}px]` | `size-${number}` | `size-full`;

export type ElementOfArray<Arr> = Arr extends (infer E)[] ? E : never;
