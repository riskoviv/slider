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
  (options: ISliderPluginOptions): Object;
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
  'handle1MouseMove' |
  'value1Changed';

interface IEventEmitter {
  private events: EventsStorage;
  on(evt: EventName, listener: Function): this;
  protected emit(evt: EventName, arg?: unknown): void;
}

interface ISliderModel {
  getOptions(): ISliderPluginOptions
}

interface ISliderSubView extends IEventEmitter {
  $thisElem: JQuery<HTMLElement>;
}
