import $ from 'jquery';

import Model from './Model';
import Presenter from './Presenter';
import './styles/styles.scss';
import { getEntriesWithTypedKeys } from './utils';

const defaultOptions: SliderOptions = {
  stepSize: 10,
  minValue: -100,
  maxValue: 100,
  value1: -50,
  value2: 50,
  isVertical: false,
  isInterval: false,
  showTip: false,
  showScale: false,
  showProgressBar: false,
};
let cleanContainerIfNotEmpty: (container: JQuery) => void;
let fixCustomOptions: (options: Partial<SliderOptions>) => null | Partial<SliderOptions>;
let checkOptionsValues: (options: SliderOptions) => SliderOptions;

$.fn.sliderPlugin = function sliderPlugin(
  this: JQuery,
  options: Partial<SliderOptions> = {},
): JQuery {
  cleanContainerIfNotEmpty(this);

  const pluginOptions = checkOptionsValues({
    ...defaultOptions,
    ...fixCustomOptions(options),
  });

  const model = new Model(pluginOptions);
  const presenter = new Presenter(this, model);
  const $sliderElem = presenter.view.$elem;

  ({
    getOptions: $sliderElem.getOptions,
    subscribe: $sliderElem.subscribe,
    unsubscribe: $sliderElem.unsubscribe,
  } = model.publicDataMethods);

  const makeValueMethodChainable = (method: ValueHandler) => {
    const chainedMethod = (arg: number) => {
      method(arg);
      return $sliderElem;
    };
    Object.defineProperty(chainedMethod, 'name', { value: method.name.substring(6) });
    return chainedMethod;
  };

  const makeStateMethodChainable = (method: StateHandler) => {
    const chainedMethod = (arg: boolean) => {
      method(arg);
      return $sliderElem;
    };
    Object.defineProperty(chainedMethod, 'name', { value: method.name.substring(6) });
    return chainedMethod;
  };

  getEntriesWithTypedKeys(model.publicValueMethods).forEach(([methodName, method]) => {
    $sliderElem[methodName] = makeValueMethodChainable(method);
  });

  getEntriesWithTypedKeys(model.publicStateMethods).forEach(([methodName, method]) => {
    $sliderElem[methodName] = makeStateMethodChainable(method);
  });

  return $sliderElem;
};

cleanContainerIfNotEmpty = (container: JQuery): void => {
  if (container.not(':empty').length > 0) {
    container.empty();
    console.warn('Warning: The element where you intended to initialize the plugin has contained something. It was cleared and now has only the new slider-plugin instance.');
  }
};

fixCustomOptions = (options: Partial<SliderOptions>) => {
  const notAnObject = typeof options !== 'object' || options === null;
  const isArrayOrNotAnObject = notAnObject || Object.prototype.hasOwnProperty.call(options, 'length');
  if (isArrayOrNotAnObject) {
    console.warn('Warning: options object passed to plugin has wrong type (must be an object)');
    return null;
  }

  if (Object.keys(options).length === 0) {
    return {};
  }

  const checkedOptions = { ...options };

  type PluginOptionsEntry = [
    keyof Partial<SliderOptions>,
    TypeOfValues<Partial<SliderOptions>>
  ];

  getEntriesWithTypedKeys(options).forEach(
    (option: PluginOptionsEntry) => {
      const [key, value] = option;

      if (defaultOptions[key] === undefined) {
        console.warn(`Warning: option named ${key} is irrelevant`);
        delete checkedOptions[key];
      } else if (typeof value !== typeof defaultOptions[key]) {
        console.warn(`Warning: option named ${key} has wrong value type (${typeof value}), but must be of type ${typeof defaultOptions[key]}`);
        delete checkedOptions[key];
      } else if (typeof defaultOptions[key] === 'number') {
        if (!Number.isFinite(value)) {
          console.warn(`Warning: option named ${key} must be a number > 0, but value provided in options is not correct number`);
          delete checkedOptions[key];
        }
      }
    },
  );

  return checkedOptions;
};

checkOptionsValues = (options: SliderOptions) => {
  const pluginOptions = { ...options };
  const warnMsgEnd = '\nPlease check values that you passed to plugin options';

  if (pluginOptions.stepSize < 0) {
    pluginOptions.stepSize = -pluginOptions.stepSize;
    console.warn(`Warning: stepSize < 0 in plugin options. stepSize is set to absolute value of it (${pluginOptions.stepSize}).${warnMsgEnd}`);
  }

  if (pluginOptions.stepSize === 0) {
    pluginOptions.stepSize = 10;
    console.warn(`Warning: stepSize is 0 in plugin options. stepSize is reset to default value (10).${warnMsgEnd}`);
  }

  if (pluginOptions.minValue > pluginOptions.maxValue) {
    [
      pluginOptions.minValue,
      pluginOptions.maxValue,
    ] = [
      pluginOptions.maxValue,
      pluginOptions.minValue,
    ];
    console.warn(`Warning: minValue is greater than maxValue in plugin options. Values are now swapped.${warnMsgEnd}.`);
  } else if (pluginOptions.minValue === pluginOptions.maxValue) {
    pluginOptions.maxValue += pluginOptions.stepSize;
    console.warn(`Warning: maxValue is equal to minValue in plugin options. maxValue is now increased by stepSize (${pluginOptions.stepSize}).${warnMsgEnd}.`);
  }

  if (pluginOptions.value1 < pluginOptions.minValue) {
    pluginOptions.value1 = pluginOptions.minValue;
    console.warn(`Warning: value1 < minValue in plugin options. value1 is now set to minValue.${warnMsgEnd}.`);
  } else if (pluginOptions.value1 > pluginOptions.maxValue) {
    if (pluginOptions.isInterval) {
      pluginOptions.value1 = pluginOptions.maxValue - pluginOptions.stepSize;
      console.warn(`Warning: value1 > maxValue in plugin options. value1 is now set to maxValue - stepSize.${warnMsgEnd}.`);
    } else {
      pluginOptions.value1 = pluginOptions.maxValue;
      console.warn(`Warning: value1 > maxValue in plugin options. value1 is now set to maxValue.${warnMsgEnd}.`);
    }
  }

  if (pluginOptions.isInterval) {
    if (pluginOptions.value2 < pluginOptions.minValue) {
      pluginOptions.value2 = pluginOptions.minValue + pluginOptions.stepSize;
      console.warn(`Warning: value2 < minValue in plugin options. value2 is now set to minValue + stepSize.${warnMsgEnd}.`);
    } else if (pluginOptions.value2 > pluginOptions.maxValue) {
      pluginOptions.value2 = pluginOptions.maxValue;
      console.warn(`Warning: value2 > maxValue in plugin options. value2 is now set to maxValue.${warnMsgEnd}.`);
    }

    if (pluginOptions.value1 > pluginOptions.value2) {
      [
        pluginOptions.value1,
        pluginOptions.value2,
      ] = [
        pluginOptions.value2,
        pluginOptions.value1,
      ];
      console.warn(`Warning: value1 > value2 in plugin options. Values are now swapped.${warnMsgEnd}.`);
    }
  }

  const totalSliderRange = pluginOptions.maxValue - pluginOptions.minValue;

  if (pluginOptions.stepSize >= totalSliderRange) {
    console.warn(`Warning: stepSize (${pluginOptions.stepSize}) must be less that slider range (${totalSliderRange}). stepSize is now reset to 1.${warnMsgEnd}.`);
    pluginOptions.stepSize = 1;
  }

  return pluginOptions;
};
