interface ISliderPluginValueOptions {
  stepSize: number,
  minValue: number,
  maxValue: number,
  value1: number,
  value2: number,
  handle1Pos: number,
  handle2Pos: number,
}

interface ISliderPluginStateOptions {
  isVertical: boolean,
  isInterval: boolean,
  showTip: boolean,
  showScale: boolean,
  showProgressBar: boolean,
}

interface ISliderPluginOptions extends ISliderPluginValueOptions, ISliderPluginStateOptions {
  [option: string],
}

interface ISliderPluginGlobalOptions {
  options: ISliderPluginOptions;
}

interface ISliderPluginFunction {
  (options: ISliderPluginOptions): Object | null;
}

interface ISliderPlugin extends ISliderPluginGlobalOptions, ISliderPluginFunction { }

interface ISliderPluginPublicMethods {
  getOptions: Function,
  setStepSize: Function,
  toggleVertical: Function,
}

interface JQuery extends ISliderPluginPublicMethods {
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
}

interface ISliderModel {
  getOptions(): ISliderPluginOptions
}

interface ISliderHTMLElement extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
}

interface ISliderHandleView extends ISliderHTMLElement {
  setPositionAndCurrentValue?: (allowedPosition: number) => void;
  otherHandlePosition?: number;
}

interface ISliderBaseView extends ISliderHTMLElement {}

interface ISliderTipView extends ISliderHTMLElement {
  setValue?(value: number): void;
  setPosition?(position: number): void;
}

interface ISliderScaleView extends ISliderHTMLElement {}

interface ISliderProgressView extends ISliderHTMLElement {
  updateProgressSize?(handleNumber: number, handlePosition: number): void;
}

interface ISliderSubView extends
  IEventEmitter,
  ISliderHandleView,
  ISliderBaseView,
  ISliderTipView,
  ISliderScaleView,
  ISliderProgressView {}

type HandleBounds = {
  minValue: number,
  maxValue: number,
  stepSize: number,
};

type HandleParams = {
  stepSizeInPercents: number,
  halfStep: number,
  allowedPositions: number[],
  isInterval: boolean,
};

type SliderAxis = 'left' | 'top';

type SliderDimension = 'width' | 'height';
