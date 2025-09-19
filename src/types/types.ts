export type GachaTypeButtonId = 'limited' | 'standard' | 'collab';

export type GachaTypeButtonLabel = '한정' | '일반' | '콜라보';

export type GachaTypeButtonCustom = {
  state: 'initial' | 'normal';
  hoverBackground: string;
  isActive: boolean;
};

export type GachaTypeButton = {
  name: GachaTypeButtonLabel;
  id: GachaTypeButtonId;
  hoverBackground: string;
};
