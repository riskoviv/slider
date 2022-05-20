/* eslint-disable no-redeclare */
interface IPluginValueOptions {
  stepSize: number;
  minValue: number;
  maxValue: number;
  value1: number;
  value2: number;
}

interface IPluginStateOptions {
  isVertical: boolean;
  isInterval: boolean;
  showTip: boolean;
  showScale: boolean;
  showProgressBar: boolean;
}

interface IPluginOptions extends IPluginValueOptions, IPluginStateOptions {}

/**
 * Returns type of values of object-like type
 */
type TypeOfValues<Obj> = Obj[keyof Obj];

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: Partial<IPluginOptions>): JQuery | null;
}

interface IPluginPublicMethods {
  debug: { [methodName: string]: () => IPluginOptions };
  setStepSize: (stepSize: number) => void;
  setValue: (thumbNumber: 1 | 2, valueIndex: number) => void;
  setVerticalState: (isVertical: boolean) => void;
  setInterval(isInterval: boolean): void;
}

interface JQuery extends IPluginPublicMethods {
  sliderPlugin: IPluginFunction;
}

type EventName = (
  | 'sliderPointerDown'
  | 'stepSizeChanged'
  | 'valueChanged'
  | 'scaleValueSelect'
  | 'isVerticalChanged'
  | 'isIntervalChanged'
);

type EventHandler<argumentType> = (arg: argumentType) => void;

type EventsStorage = {
  [event in EventName]?: Set<EventHandler>;
};

interface IEventEmitter {
  on<argumentType>(evt: EventName, handler: EventHandler<argumentType>): this;
  off<argumentType>(evt: EventName, handler?: EventHandler<argumentType>): this;
}

type ViewValues = {
  positions: { 1: number, 2: number },
  penultimatePosition: number,
  stepInPercents: number,
  halfStepInPercents: number,
  halfStepFromPenultimateToMax: number,
};

interface IModel extends IEventEmitter {
  options: IPluginOptions;
  allowedValuesCount: number;
  fractionalPrecision: number;
  penultimateValue: number;
  viewValues: ViewValues;
  getOptions(): IPluginOptions;
  getStateOptions(): IPluginStateOptions;
  getIndexByValueNumber(valueNumber: 1 | 2): number;
  getIndexByValue(value: number): number;
  getValueByIndex(index: number): number;
  getPenultimateValue(): number;
  setStepSize(stepSize: number): void;
  setValue(thumbNumber: 1 | 2, valueIndex: number): void;
  setVerticalState(isVertical: boolean): void;
  setInterval(isInterval: boolean): void;
  fixValueToPrecision(value: number): number;
  publicMethods: IPluginPublicMethods;
}

type Axis = 'left' | 'top';
type Dimension = 'width' | 'height';

interface ISubView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  removeView(): void;
}

interface IScaleView extends ISubView {
  scaleValueElements: JQuery<HTMLDivElement>[];
  insertScaleValueElements(): void;
  optimizeValuesCount(axis: Axis, dimension: Dimension): void;
}

interface ITipView extends ISubView {
  setValue(value: number): void;
}

interface IView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  $controlContainer: JQuery<HTMLElement>;
  controlContainerElem: HTMLDivElement;
  toggleVertical(isVertical: boolean): void;
  toggleInterval(isInterval: boolean): void;
  setPosition(valueNumber: 1 | 2, position: number): void;
  setThumbThickness(thickness: number): void;
}

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};

type ViewType = (
  | 'track'
  | 'thumb'
  | 'scale'
  | 'tip'
);
