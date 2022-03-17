import Model from './Model';
import Presenter from './Presenter';
import './styles/styles.scss';
import utils from './utils';

const defaultOptions: IPluginOptions = {
  stepSize: 10,
  minValue: -100,
  maxValue: 100,
  value1: -50,
  value2: 50,
  sliderSize: 30,
  isVertical: false,
  isInterval: false,
  showTip: false,
  showScale: false,
  showProgressBar: false,
};
let containerHasProblems: (container: JQuery) => number;
let cleanContainerIfNotEmpty: (container: JQuery) => void;
let fixCustomOptions: (options: Partial<IPluginOptions>) => null | Partial<IPluginOptions>;
let checkOptionsValues: (options: IPluginOptions) => IPluginOptions;

$.fn.sliderPlugin = function sliderPlugin(
  this: JQuery,
  options: Partial<IPluginOptions> = {},
): JQuery | null {
  if (containerHasProblems(this) > 0) {
    return null;
  }

  cleanContainerIfNotEmpty(this);

  const pluginOptions = checkOptionsValues($.extend(
    {},
    defaultOptions,
    fixCustomOptions(options),
  ));

  const model = new Model(pluginOptions);
  const presenter = new Presenter(this, model);
  const $sliderElem = presenter.view.$elem;

  ({
    debug: $sliderElem.debug,
    setStepSize: $sliderElem.setStepSize,
    setValue: $sliderElem.setValue,
    setVerticalState: $sliderElem.setVerticalState,
    setInterval: $sliderElem.setInterval,
    setSliderSize: $sliderElem.setSliderSize,
  } = model.publicMethods);

  return $sliderElem;
};

containerHasProblems = (container: JQuery): number => {
  type checkBlock = {
    condition: (elem: JQuery) => boolean,
    error: () => void
  };
  const checks: checkBlock[] = [
    {
      condition: (elem: JQuery) => elem.length === 0,
      error: () => console.error('Error: Container element does not exist!'),
    },
    {
      condition: (elem: JQuery) => elem.has('.slider').length > 0,
      error: () => console.error('Error: Container already contains slider! You can\'t make more than one slider on one HTML element. So new slider wasn\'t created.'),
    },
    {
      condition: (elem: JQuery) => elem.closest('.slider').length > 0,
      error: () => console.error('Error: Container is located inside other slider plugin. New slider plugin cannot be created here.'),
    },
  ];

  return checks.reduce((result: number, check: checkBlock) => {
    if (check.condition(container)) {
      check.error();
      return result + 1;
    }
    return result;
  }, 0);
};

cleanContainerIfNotEmpty = (container: JQuery): void => {
  if (container.not(':empty').length > 0) {
    container.empty();
    console.warn('Warning: An element where you intended to initialize the plugin contained something. It was cleared and now has only the slider-plugin\'s elements.');
  }
};

fixCustomOptions = (options: Partial<IPluginOptions>) => {
  if (typeof options !== 'object' || Object.prototype.hasOwnProperty.call(options, 'length')) {
    console.warn('Warning: options object passed to plugin has wrong type (must be an object)');
    return null;
  }

  const checkedOptions = { ...options };

  type pluginOptionsEntry = [
    keyof Partial<IPluginOptions>,
    TypeOfValues<Partial<IPluginOptions>>
  ];

  utils.getEntriesWithTypedKeys(options).forEach(
    (option: pluginOptionsEntry) => {
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
        } else if (key === 'sliderSize' && value !== undefined) {
          if (value <= 0) {
            console.warn('Warning: sliderSize value must be more than 0');
            delete checkedOptions[key];
          }
        }
      }
    },
  );

  return checkedOptions;
};

checkOptionsValues = (options: IPluginOptions) => {
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

  if (pluginOptions.isInterval && pluginOptions.value1 > pluginOptions.value2) {
    [
      pluginOptions.value1,
      pluginOptions.value2,
    ] = [
      pluginOptions.value2,
      pluginOptions.value1,
    ];
    console.warn(`Warning: value1 > value2 in plugin options. Values are now swapped.${warnMsgEnd}.`);
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
  }

  const totalSliderRange = pluginOptions.maxValue - pluginOptions.minValue;

  if (pluginOptions.stepSize >= totalSliderRange) {
    console.warn(`Warning: stepSize (${pluginOptions.stepSize}) must be less that slider range (${totalSliderRange}). stepSize is now reset to 1.${warnMsgEnd}.`);
    pluginOptions.stepSize = 1;
  }

  return pluginOptions;
};
