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

interface IPluginOptions extends IPluginValueOptions, IPluginStateOptions {
  [option: string]: number | boolean,
}

type PartialPluginOptions = Partial<IPluginOptions>;

type OptionsObject = Record<string, unknown>;

interface IPluginGlobalOptions {
  options: IPluginOptions;
}

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: PartialPluginOptions): JQuery | null;
}

interface ISliderPlugin extends IPluginGlobalOptions, IPluginFunction { }

interface IPluginPublicMethods {
  debug: { [methodName: string]: () => IPluginOptions },
  setStepSize: (stepSize: number) => void,
  setVerticalState: (isVertical: boolean) => void,
  setValue: (handleNumber: 1 | 2, valueIndex: number) => void,
}

interface JQuery extends IPluginPublicMethods {
  sliderPlugin: ISliderPlugin;
}

type EventName =
  'stepSizeChanged' |
  'handleValueChange' |
  'valueChanged' |
  'scaleValueSelect' |
  'getOtherHandlePosition' |
  'isVerticalChanged';

type EventHandler = (options: OptionsObject) => void;

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
}

interface IView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  $controlContainer?: JQuery<HTMLElement>;
  setPosition?(position: number): void;
  setValue?(value: string): void;
  removeView(): void;
}

type Axis = 'left' | 'top';

type Dimension = 'width' | 'height';

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};

type TypeOfValues<T> = T[keyof T];

type ViewType =
  'base' |
  'handle' |
  'progress' |
  'scale' |
  'tip';
