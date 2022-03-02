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

interface IPluginGlobalOptions {
  options: IPluginOptions;
}

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: Partial<IPluginOptions>): JQuery | null;
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
  | 'stepSizeChanged'
  | 'thumbValueChange'
  | 'valueChanged'
  | 'scaleValueSelect'
  | 'isVerticalChanged'
  | 'isIntervalChanged';

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
  stepSizeInPercents: number,
};

interface IModel extends IEventEmitter {
  options: IPluginOptions,
  allowedRealValues: number[],
  allowedPositions: number[],
  viewValues: ViewValues,
  getOptions(): IPluginOptions,
  getStateOptions(): IPluginStateOptions,
  publicMethods: IPluginPublicMethods,
  setValue(thumbNumber: 1 | 2, valueIndex: number): void,
}

type Axis = 'left' | 'top';
type Dimension = 'width' | 'height';

interface ISubView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  render(): JQuery<HTMLElement>
  removeView(): void;
  setValue?(value: number): void;
}

interface IScaleView extends ISubView {
  updateScale(data: {
    allowedPositions: number[],
    allowedRealValues: number[],
    dimension: Dimension,
    axis: Axis,
  }): void;
}

interface IThumbView extends ISubView {}

interface IView {
  $elem: JQuery<HTMLElement>;
  $controlContainer: JQuery<HTMLElement>;
  toggleVertical(isVertical: boolean): void;
  toggleInterval(): void;
  setPosition(valueNumber: 1 | 2, position: number): void;
}

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};

type ViewType =
  | 'base'
  | 'thumb'
  | 'progress'
  | 'scale'
  | 'tip';
