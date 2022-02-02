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
  [option: string],
}

interface IPluginGlobalOptions {
  options: IPluginOptions;
}

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: Partial<IPluginOptions>): JQuery | null;
}

interface ISliderPlugin extends IPluginGlobalOptions, IPluginFunction { }

interface IPluginPublicMethods {
  debug: { [methodName: string]: Function },
  setStepSize: Function,
  toggleVertical: Function,
  setValue: Function,
}

interface JQuery extends IPluginPublicMethods {
  sliderPlugin: ISliderPlugin;
}

type EventNames =
  'stepSizeChanged' |
  'handleValueChange' |
  'valueChanged' |
  'scaleValueSelect' |
  'getOtherHandlePosition' |
  'isVerticalChanged';

type EventsStorage = {
  [event in EventNames]?: Set<Function>;
};

interface IEventEmitter {
  on(evt: EventNames, listener: Function): this;
  off(evt: EventNames, listener?: Function): this;
}

interface IModel {
  getOptions(): IPluginOptions
}

interface IView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  render(options): void;
}

interface IHandleView extends IEventEmitter {
  setPositionAndCurrentValue?: (allowedPosition: number, findClosest: boolean) => void;
  otherHandlePosition?: number;
}

interface IBaseView extends IEventEmitter {}

interface ITipView extends IEventEmitter {
  setValue?(value: number): void;
  setPosition?(position: number): void;
}

interface IScaleView extends IEventEmitter {}

interface IProgressView extends IEventEmitter {
  updateProgressSize?(handleNumber: number, handlePosition: number): void;
}

interface ISubView extends
  IEventEmitter,
  IHandleView,
  IBaseView,
  ITipView,
  IScaleView,
  IProgressView {}

type HandleBounds = {
  minValue: number,
  maxValue: number,
  stepSize: number,
};

type HandleParams = {
  positions: { 1: number, 2: number },
  stepSizeInPercents: number,
  halfStep: number,
  allowedPositions: number[],
  isInterval: boolean,
};

type Axis = 'left' | 'top';

type Dimension = 'width' | 'height';

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};
