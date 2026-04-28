import { Dummy, GachaSimulationResult } from '#/components/PickupList';

export type SimulationMode = 'simple' | 'extended';

export type GachaType = 'limited' | 'single' | 'collab' | 'rotation' | 'contract' | 'orient';

export type GachaTypeButtonLabel =
  | '한정'
  | '단일 통상'
  | '로테이션'
  | '4중 가챠'
  | '콜라보'
  | '지향';

export type GachaTypeButtonCustom = {
  state: 'initial' | 'normal';
  hoverBackground: string;
  isActive: boolean;
  shadow?: string;
  innerShadow?: string;
};

export type GachaTypeButton = {
  name: GachaTypeButtonLabel;
  type: GachaType;
  hoverBackground: string;
};

export type OperatorType = 'limited' | 'normal';

export type OperatorRarity = 6 | 5 | 4;

export type OperatorRarityForString = 'sixth' | 'fifth' | 'fourth';

export type SizeClass = `size-[${number}px]` | `size-${number}` | `size-full`;

export type ElementOfArray<Arr> = Arr extends (infer E)[] ? E : never;

export type BatchGachaGoal = 'allFirst' | 'allMax' | null;

export type BannerFailureAction = 'interruption' | 'continueExecution';

export type SimulationOptions = {
  probability: { limited: number; normal: number };
  simulationTry: number;
  bannerFailureAction: BannerFailureAction;
  showBannerImage: boolean;
  baseSeed: number | null;
};

export type InitialOptions = {
  initialResource: number;
  batchGachaGoal: BatchGachaGoal;
  isTrySim: boolean;
  isSimpleMode: boolean;
  options: SimulationOptions;
};

export type UserConfig = {
  isTrySim: boolean;
  isSimpleMode: boolean;
  batchGachaGoal: BatchGachaGoal;
  initialResource: number;
  options: SimulationOptions;
};

export interface ProgressRefProps {
  progressTry: number;
  total: number;
  gachaRuns: number;
  success: number;
  results: GachaSimulationResult[];
}

export type DTOOptions = {
  initialResource: number;
  batchGachaGoal: BatchGachaGoal;
  isTrySim: boolean;
  isSimpleMode: boolean;
};

export type DTO = { pickupDatas: Dummy[]; optionDatas: DTOOptions };
