/* eslint-disable no-use-before-define */
/* eslint-disable no-redeclare */
type ValueOptions = {
  stepSize: number,
  minValue: number,
  maxValue: number,
  value1: number,
  value2: number,
};

type StateOptions = {
  isVertical: boolean,
  isInterval: boolean,
  showTip: boolean,
  showScale: boolean,
  showProgressBar: boolean,
};

type SliderOptions = ValueOptions & StateOptions;

/**
 * Returns type of values of object-like type
 */
type TypeOfValues<Obj> = Obj[keyof Obj];

type ValueEvent = (
  | 'value1Changed'
  | 'value2Changed'
  | 'stepSizeChanged'
  | 'minValueChanged'
  | 'maxValueChanged'
);

type StateEvent = (
  | 'isVerticalChanged'
  | 'isIntervalChanged'
  | 'showProgressChanged'
  | 'showTipChanged'
  | 'showScaleChanged'
)

type ModelEvent = ValueEvent | StateEvent;

type SliderPointerDownEvent = 'sliderPointerDown';
type ScaleValueSelectEvent = 'scaleValueSelect';

type SliderPointerDownData = {
  target: HTMLDivElement;
  offsetX: number;
  offsetY: number;
};

type SetValueEventOptions = {
  changeTipValue?: boolean,
  onlySaveValue?: boolean,
  checkTipsOverlap?: boolean,
};

type ChangeIntervalEventOptions = {
  checkTipsOverlap?: boolean,
};

interface Unsubscribable {
  unsubscribe?(): boolean;
}

interface UnsubHTMLInputElement extends HTMLInputElement, Unsubscribable {}

interface ValueHandler extends Unsubscribable {
  (value: number, options?: SetValueEventOptions): void;
}
interface StateHandler extends Unsubscribable {
  (value: boolean, options?: ChangeIntervalEventOptions): void;
}
interface SliderPointerDownHandler extends Unsubscribable {
  (value: SliderPointerDownData): void;
}

interface ScaleValueSelectHandler extends Unsubscribable {
  (value: number): void;
}

type Subscriber = UnsubHTMLInputElement | ValueHandler | StateHandler;

type ValueHandlers = {
  [valueEvent in ValueEvent]?: Map<UnsubHTMLInputElement | ValueHandler | undefined, ValueHandler>;
};
type StateHandlers = {
  [stateEvent in StateEvent]?: Map<UnsubHTMLInputElement | StateHandler | undefined, StateHandler>;
};
type ViewHandlers = {
  sliderPointerDown?: Map<undefined, (value: SliderPointerDownData) => void>;
  scaleValueSelect?: Map<undefined, (data: number) => void>;
};

type ValueOn = {
  event: ValueEvent,
  handler: ValueHandler,
  subscriber?: UnsubHTMLInputElement | ValueHandler,
};

type StateOn = {
  event: StateEvent,
  handler: StateHandler,
  subscriber?: UnsubHTMLInputElement | StateHandler,
};

type SliderPointerDownOn = {
  event: SliderPointerDownEvent,
  handler: SliderPointerDownHandler,
};

type ScaleValueSelectOn = {
  event: ScaleValueSelectEvent,
  handler: ScaleValueSelectHandler,
};

type ViewOn = SliderPointerDownOn | ScaleValueSelectOn;

interface IEventEmitter {
  on(options: ValueOn): this;
  on(options: StateOn): this;
  on(options: ViewOn): this;
  // on(options: ValueOn | StateOn | ViewOn): this;
}

type ValueEmit = { event: ValueEvent, value: number, options?: SetValueEventOptions };
type StateEmit = { event: StateEvent, value: boolean, options?: ChangeIntervalEventOptions };
type SliderPointerDownEmit = { event: SliderPointerDownEvent, value: SliderPointerDownData };
type ScaleValueSelectEmit = { event: ScaleValueSelectEvent, value: number };
type ViewEmit = SliderPointerDownEmit | ScaleValueSelectEmit;

type ValueSubscribe = Required<Omit<ValueOn, 'handler'>>;
type StateSubscribe = Required<Omit<StateOn, 'handler'>>;

interface ModelStateMethods {
  setVerticalState(isVertical: boolean): void;
  setInterval(isInterval: boolean): void;
  setShowProgress(showProgressBar: boolean): void;
  setShowTip(showTip: boolean): void;
  setShowScale(showScale: boolean): void;
}

interface ModelValueMethods {
  setValue1(value: number): void;
  setValue2(value: number): void;
  setStepSize(stepSize: number): void;
  setMinValue(minValue: number): void;
  setMaxValue(maxValue: number): void;
}

interface PluginDataMethods {
  getOptions(): SliderOptions;
  subscribe(options: ValueSubscribe): void;
  subscribe(options: StateSubscribe): void;
  subscribe(options: ValueSubscribe | StateSubscribe): void;
  unsubscribe(subscriber: Subscriber): boolean;
}

interface ModelMethods extends ModelStateMethods, ModelValueMethods, PluginDataMethods {}

type ArgumentTypes<T> = T extends (...args: infer U) => infer R ? U : never;
type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;

type PluginStateMethods = {
  [methodName in keyof ModelStateMethods]: ReplaceReturnType<
    ModelStateMethods[methodName], JQuery<HTMLElement>
  >;
};

type PluginValueMethods = {
  [methodName in keyof ModelValueMethods]: ReplaceReturnType<
    ModelValueMethods[methodName], JQuery<HTMLElement>
  >;
};

interface PluginMethods extends PluginStateMethods, PluginValueMethods, PluginDataMethods {}

interface IPluginFunction {
  (options?: Partial<SliderOptions>): JQuery;
}

interface JQuery extends PluginMethods {
  sliderPlugin: IPluginFunction;
}

interface IPresenter {
  readonly view: IView;
}

type ViewValues = {
  positions: { 1: number, 2: number },
  penultimatePosition: number,
  stepInPercents: number,
};

interface IModel extends IEventEmitter, ModelMethods {
  options: SliderOptions;
  allowedValues: number[];
  allowedValuesCount: number;
  fractionalPrecision: number;
  penultimateValue: number;
  viewValues: ViewValues;
  publicValueMethods: ModelValueMethods;
  publicStateMethods: ModelStateMethods;
  publicDataMethods: PluginDataMethods;
  createAllowedValuesArray(): number[];
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
type PositionDimension = 'offsetTop' | 'offsetLeft';

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

interface ViewValueMethods {
  setPosition(valueNumber: 1 | 2, position: number): void;
  setThumbThickness(thickness: number): void;
}

interface ViewStateMethods {
  toggleVertical(isVertical: boolean): void;
  toggleInterval(isInterval: boolean): void;
  toggleProgressBar(showProgress: boolean): void;
}

interface ViewMethods extends ViewValueMethods, ViewStateMethods {}

interface IView extends ViewMethods, IEventEmitter {
  $elem: JQuery<HTMLElement>;
  $controlContainer: JQuery<HTMLElement>;
  controlContainerElem: HTMLDivElement;
}

type ViewType = (
  | 'track'
  | 'thumb'
  | 'scale'
  | 'tip'
);
