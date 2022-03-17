/* eslint-disable no-redeclare */
interface IPluginValueOptions {
  stepSize: number,
  minValue: number,
  maxValue: number,
  value1: number,
  value2: number,
}

interface IPluginStateOptions {
  isVertical: boolean,
  isInterval: boolean,
  showTip: boolean,
  showScale: boolean,
  showProgressBar: boolean,
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
  debug: { [methodName: string]: () => IPluginOptions },
  setStepSize: (stepSize: number) => void,
  setValue: (thumbNumber: 1 | 2, valueIndex: number) => void,
  setVerticalState: (isVertical: boolean) => void,
  setInterval(isInterval: boolean): void,
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
  stepInPercents: number,
  halfStepInPercents: number,
};

interface IModel extends IEventEmitter {
  options: IPluginOptions,
  allowedValues: number[],
  allowedPositions: number[],
  viewValues: ViewValues,
  getOptions(): IPluginOptions,
  getStateOptions(): IPluginStateOptions,
  getValueIndex(valueNumber: 1 | 2): number,
  setStepSize(stepSize: number): void,
  setValue(thumbNumber: 1 | 2, valueIndex: number): void,
  setVerticalState(isVertical: boolean): void,
  setInterval(isInterval: boolean): void,
  publicMethods: IPluginPublicMethods,
}

type Axis = 'left' | 'top';
type Dimension = 'width' | 'height';

interface ISubView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  removeView(): void;
}

interface IScaleView extends ISubView {
  updateScale(data: {
    allowedPositions: number[],
    allowedValues: number[],
    dimension: Dimension,
    axis: Axis,
  }): void;
  initResizeObserver(dimension: Dimension, axis: Axis): void;
}

interface IThumbView extends ISubView {
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
  | 'base'
  | 'thumb'
  | 'progress'
  | 'scale'
  | 'tip'
);
