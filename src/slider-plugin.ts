import SliderModel from './SliderModel';
import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

let containerHasProblems: Function;
let cleanContainerIfNotEmpty: Function;
let fixCustomOptions: Function;
let checkOptionsValues: Function;

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: Partial<ISliderPluginOptions> = {}): JQuery | null {
    if (containerHasProblems(this) > 0) {
      return null;
    }

    cleanContainerIfNotEmpty(this);

    const pluginOptions = checkOptionsValues($.extend(
      {},
      $.fn.sliderPlugin.options,
      fixCustomOptions(options),
    ));

    const model = new SliderModel(pluginOptions);
    const presenter = new SliderPresenter(this, model);
    const $sliderElem = presenter.$pluginElem;

    ({
      getOptions: $sliderElem.getOptions,
      setStepSize: $sliderElem.setStepSize,
      toggleVertical: $sliderElem.toggleVertical,
    } = presenter.publicMethods);

    return $sliderElem;
  },
  {
    options: {
      stepSize: 10,
      minValue: -100,
      maxValue: 100,
      value1: -50,
      value2: 50,
      isVertical: false,
      isInterval: true,
      showTip: true,
      showScale: true,
      showProgressBar: true,
    },
  },
);

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

fixCustomOptions = (options: Partial<ISliderPluginOptions>) => {
  if (typeof options !== 'object' || options.length !== undefined) {
    console.warn('Warning: options object passed to plugin has wrong type (must be an object)');
    return {};
  }

  const defaultOptions = $.fn.sliderPlugin.options;
  const checkedOptions = { ...options };

  Object.entries(options).forEach(
    (option: [keyof Partial<ISliderPluginOptions>, number | boolean]) => {
      const [key, value] = option;

      if (defaultOptions[key] === undefined) {
        console.warn(`Warning: option named ${key} is irrelevant`);
        delete checkedOptions[key];
      } else if (typeof value !== typeof defaultOptions[key]) {
        console.warn(`Warning: option named ${key} has wrong value type (${typeof value}), but must be of type ${typeof defaultOptions[key]}`);
        delete checkedOptions[key];
      }
    },
  );

  return checkedOptions;
};

checkOptionsValues = (options: ISliderPluginOptions) => {
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

  if (pluginOptions.value1 > pluginOptions.value2) {
    [pluginOptions.value1, pluginOptions.value2] = [pluginOptions.value2, pluginOptions.value1];
    console.warn(`Warning: value1 > value2 in plugin options. Values are now swapped.${warnMsgEnd}.`);
  }

  if (pluginOptions.value1 < pluginOptions.minValue) {
    pluginOptions.value1 = pluginOptions.minValue;
    console.warn(`Warning: value1 < minValue in plugin options. value1 is now set to minValue.${warnMsgEnd}.`);
  } else if (pluginOptions.value1 > pluginOptions.maxValue) {
    pluginOptions.value1 = pluginOptions.maxValue - pluginOptions.stepSize;
    console.warn(`Warning: value1 > maxValue in plugin options. value1 is now set to maxValue - stepSize.${warnMsgEnd}.`);
  }

  if (pluginOptions.value2 < pluginOptions.minValue) {
    pluginOptions.value2 = pluginOptions.minValue + pluginOptions.stepSize;
    console.warn(`Warning: value2 < minValue in plugin options. value2 is now set to minValue + stepSize.${warnMsgEnd}.`);
  } else if (pluginOptions.value2 > pluginOptions.maxValue) {
    pluginOptions.value2 = pluginOptions.maxValue;
    console.warn(`Warning: value2 > maxValue in plugin options. value2 is now set to maxValue.${warnMsgEnd}.`);
  }

  const totalSliderRange = pluginOptions.maxValue - pluginOptions.minValue;

  if (pluginOptions.stepSize >= totalSliderRange) {
    console.warn(`Warning: stepSize (${pluginOptions.stepSize}) must be less that slider range (${totalSliderRange}). stepSize is now reset to 10% of total slider range (${totalSliderRange * 0.1}).${warnMsgEnd}.`);
    pluginOptions.stepSize = totalSliderRange * 0.1;
  }

  return pluginOptions;
};
