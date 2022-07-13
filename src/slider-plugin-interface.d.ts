/* eslint-disable no-redeclare */
interface IPluginValueOptions {
  stepSize: number;
  minValue: number;
  maxValue: number;
  value1: number;
  value2: number;
}

interface IPluginStateOptions {
  isVertical: boolean;
  isInterval: boolean;
  showTip: boolean;
  showScale: boolean;
  showProgressBar: boolean;
}

interface IPluginOptions extends IPluginValueOptions, IPluginStateOptions {}

/**
 * Returns type of values of object-like type
 */
type TypeOfValues<Obj> = Obj[keyof Obj];

type ModelEvent = (
  | 'value1Changed'
  | 'value2Changed'
  | 'stepSizeChanged'
  | 'minValueChanged'
  | 'maxValueChanged'
  | 'isVerticalChanged'
  | 'isIntervalChanged'
  | 'showProgressChanged'
  | 'showTipChanged'
  | 'showScaleChanged'
);

type ViewEvent = 'sliderPointerDown' | 'scaleValueSelect';

type SliderEvent = ModelEvent | ViewEvent;

interface IPluginFunction {
  // eslint-disable-next-line no-use-before-define
  (options: Partial<IPluginOptions> = {}): JQuery;
}

interface IPluginPublicStateMethods {
  setVerticalState(isVertical: boolean): void;
  setInterval(isInterval: boolean): void;
  setShowProgress(showProgressBar: boolean): void;
  setShowTip(showTip: boolean): void;
  setShowScale(showScale: boolean): void;
}

interface IPluginPublicValueMethods {
  setValue1(value: number): void;
  setValue2(value: number): void;
  setStepSize(stepSize: number): void;
  setMinValue(minValue: number): void;
  setMaxValue(maxValue: number): void;
}

interface HTMLInputElementWithUnsubscribe extends HTMLInputElement {
  unsubscribe?(): boolean;
}

type SliderPointerDownData = {
  target: HTMLDivElement;
  offsetX: number;
  offsetY: number;
};

type SetValueEventOptions = {
  changeTipValue: boolean,
  onlySaveValue?: boolean,
};

interface EventHandler<Value> {
  (value: Value, options?: SetValueEventOptions): void;
  unsubscribe?(): boolean;
}

type Subscriber<Value> = HTMLInputElementWithUnsubscribe | EventHandler<Value>;

type EventsStorage = {
  [event in SliderEvent]?: Map<Subscriber | undefined, EventHandler>;
};

interface IPluginPublicMethods extends IPluginPublicStateMethods, IPluginPublicValueMethods {
  getOptions(): IPluginOptions;
  subscribe<Value>(
    event: ModelEvent,
    elementOrCallback: Subscriber<Value>,
  ): void;
  unsubscribe<Value>(
    elementOrCallback: Subscriber<Value>,
  ): boolean;
}

interface JQuery extends IPluginPublicMethods {
  sliderPlugin: IPluginFunction;
}

interface IEventEmitter {
  on<Value>(
    event: SliderEvent,
    handler: EventHandler<Value>,
    subscriber?: Subscriber<Value>,
  ): this;
  off<Value>(subscriber: Subscriber<Value>): boolean;
}

type ViewValues = {
  positions: { 1: number, 2: number },
  penultimatePosition: number,
  stepInPercents: number,
};

interface IModel extends IEventEmitter, IPluginPublicMethods {
  options: IPluginOptions;
  allowedValuesCount: number;
  fractionalPrecision: number;
  penultimateValue: number;
  viewValues: ViewValues;
  publicMethods: IPluginPublicMethods;
  getIndexByValueNumber(valueNumber: 1 | 2): number;
  getIndexByValue(value: number, precision?: number): number;
  getValueByIndex(index: number): number;
  getPenultimateValue(): number;
  getAllowedValuesCount(): number;
  fixValueToPrecision(value: number): number;
  setValue(number: 1 | 2, value: number, onlySaveValue?: boolean): void;
}

type PositionAxis = 'left' | 'top';
type SizeDimension = 'offsetWidth' | 'offsetHeight';

interface ISubView extends IEventEmitter {
  $elem: JQuery<HTMLElement>;
  removeView(): void;
}

interface IScaleView extends ISubView {
  scaleValueElements: JQuery<HTMLDivElement>[];
  insertScaleValueElements(): void;
  optimizeValuesCount(axis: PositionAxis, offsetSize: SizeDimension): void;
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
  toggleProgressBar(showProgress: boolean): void;
  setPosition(valueNumber: 1 | 2, position: number): void;
  setThumbThickness(thickness: number): void;
}

type ViewParams = {
  parentElement?: JQuery<HTMLElement>,
  elementNumber?: 1 | 2,
};

type ViewType = (
  | 'track'
  | 'thumb'
  | 'scale'
  | 'tip'
);
