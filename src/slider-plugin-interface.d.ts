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

type PartialPluginOptions = Partial<IPluginOptions>;

/**
 * Returns type of values of object-like type
 */
 type TypeOfValues<T> = T[keyof T];

interface IPluginGlobalOptions {
  options: IPluginOptions;
}

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: PartialPluginOptions): JQuery | null;
}

interface ISliderPlugin extends IPluginGlobalOptions, IPluginFunction {}

interface IPluginPublicMethods {
  debug: { [methodName: string]: () => IPluginOptions },
  setStepSize: (stepSize: number) => void,
  setVerticalState: (isVertical: boolean) => void,
  setValue: (thumbNumber: 1 | 2, valueIndex: number) => void,
}

interface JQuery extends IPluginPublicMethods {
  sliderPlugin: ISliderPlugin;
}

type EventName =
  'stepSizeChanged' |
  'thumbValueChange' |
  'valueChanged' |
  'scaleValueSelect' |
  'getOtherHandlePosition' |
  'isVerticalChanged' |
  'isIntervalChanged';

type EventHandlers = {
  changeStepSize: (options: { stepSize: number }) => void,
  changeOrientation: (options: { isVertical: boolean }) => void,
  changeInterval: (options: { isInterval: boolean }) => void,
  changeTipValue: (options: { number: 1 | 2, value: number }) => void,
  thumbValueChange: (options: { thumbNumber: 1 | 2, index: number }) => void,
  scaleValueSelect: (options: { index: number }) => void,
};

type EventHandler = TypeOfValues<EventHandlers>;

type EventsStorage = {
  [event in EventName]?: Set<EventHandler>;
};

interface IEventEmitter {
  on(evt: EventName, listener: EventHandler): this;
  off(evt: EventName, listener?: EventHandler): this;
}

type ViewValues = {
  positions: { 1: number, 2: number },
  stepSizeInPercents: number,
};

interface IModel extends IEventEmitter {
  options: IPluginOptions,
  allowedRealValues: number[],
  allowedPositions: number[],
  viewValues: ViewValues,
  getOptions(): IPluginOptions,
  publicMethods: IPluginPublicMethods,
  setValue(thumbNumber: 1 | 2, valueIndex: number): void,
}

interface ISubView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  render(): JQuery<HTMLElement>
  removeView(): void;
  setValue?(value: number): void;
}

interface ISliderView {
  $elem: JQuery<HTMLElement>;
  $controlContainer: JQuery<HTMLElement>;
  toggleVertical(): void;
  toggleInterval(): void;
  setPosition(valueNumber: 1 | 2, position: number): void;
}

type Axis = 'left' | 'top';

type Dimension = 'width' | 'height';

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};

type ViewType =
  'base' |
  'thumb' |
  'progress' |
  'scale' |
  'tip';
