/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
interface ISliderPluginOptions {
  stepSize?: number,
  minValue?: number,
  maxValue?: number,
  value1: number,
  value2: number,
  isVertical?: boolean,
  isInterval?: boolean,
  showValueHint?: boolean,
  showScale?: boolean,
  showProgressBar?: boolean,
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
  'stepSizeChanged' |
  'handle1ValueChange' |
  'value1Changed' |
  'scaleValueSelect';

interface IEventEmitter {
  private events: EventsStorage;
  on(evt: EventName, listener: Function): this;
  protected emit(evt: EventName, arg?: unknown): void;
}

interface ISliderModel {
  getOptions(): ISliderPluginOptions
}

interface ISliderHandleView {
  setPositionAndCurrentValue?(allowedLeft: number): void;
  allowedValues?: number[];
}

interface ISliderBaseView {}

interface ISliderTipView {
  setValue?(value: number): void;
  setPosition?(left: number): void;
}

interface ISliderScaleView {}

interface ISliderSubView extends
  IEventEmitter,
  ISliderHandleView,
  ISliderBaseView,
  ISliderTipView,
  ISliderScaleView {
  $elem: JQuery<HTMLElement>;
}

type HandleBounds = {
  minValue: number,
  maxValue: number,
  stepSize: number,
};
