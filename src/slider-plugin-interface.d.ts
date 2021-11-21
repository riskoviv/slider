/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
interface ISliderPluginValueOptions {
  stepSize?: number,
  minValue?: number,
  maxValue?: number,
  value1: number,
  value2: number,
  handle1Pos?: number,
  handle2Pos?: number,
}

interface ISliderPluginStateOptions {
  isVertical?: boolean,
  isInterval?: boolean,
  showTip?: boolean,
  showScale?: boolean,
  showProgressBar?: boolean,
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

interface JQuery {
  sliderPlugin: ISliderPlugin;
}

type EventsStorage = {
  [event in EventName]?: Function[];
};

type EventName =
  'noEventName' |
  'stepSizeChanged' |
  'handleValueChange' |
  'valueChanged' |
  'scaleValueSelect' |
  'getOtherHandlePosition' |
  'isVerticalChanged';

interface IEventEmitter {
  private events: EventsStorage;
  on(evt: EventName, listener: Function): this;
  protected emit(evt: EventName, arg?: unknown): void;
}

interface ISliderModel {
  getOptions(): ISliderPluginOptions
}

interface ISliderHandleView {
  setPositionAndCurrentValue?(allowedPosition: number): void;
  otherHandlePosition?: number;
}

interface ISliderBaseView {}

interface ISliderTipView {
  setValue?(value: number): void;
  setPosition?(position: number): void;
}

interface ISliderScaleView {
  private valueElements?: JQuery<HTMLSpanElement>[];
}

interface ISliderProgressView {
  updateProgressSize?(handleNumber: number, handlePosition: number): void;
}

interface ISliderSubView extends
  IEventEmitter,
  ISliderHandleView,
  ISliderBaseView,
  ISliderTipView,
  ISliderScaleView,
  ISliderProgressView {
  $elem: JQuery<HTMLElement>;
}

type HandleBounds = {
  minValue: number,
  maxValue: number,
  stepSize: number,
};

type HandleParams = {
  stepSizeInPercents?: number,
  halfStep?: number,
  allowedPositions?: number[],
  isInterval?: boolean,
};
