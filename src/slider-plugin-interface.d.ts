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

interface ISliderModel {
  getOptions(): ISliderPluginOptions
}
type EventsStorage = {
  [event in EventName]?: Function[];
};

type EventName =
  'stepSizeChanged' |
  'sliderElementClicked';
interface IEventEmitter {
  private events: EventsStorage;
  on(evt: EventName, listener: Function): this;
  protected emit(evt: EventName, arg?: unknown): void;
}

interface ISliderSubView extends IEventEmitter {
  HTML: JQuery<HTMLElement>;
}
