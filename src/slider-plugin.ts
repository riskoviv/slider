import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): Object {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);

    if (pluginOptions.stepSize <= 0) {
      pluginOptions.stepSize = 100;
      console.warn('Warning: stepSize ≤ 0 in plugin options. stepSize is reseted to default value (100).\nPlease check values that you passed to plugin options');
    }

    if (pluginOptions.minValue > pluginOptions.maxValue) {
      [
        pluginOptions.minValue,
        pluginOptions.maxValue,
      ] = [
        pluginOptions.maxValue,
        pluginOptions.minValue,
      ];
      console.warn('Warning: minValue is greater than maxValue in plugin options. Values are now swapped.\nPlease check values that you passed to plugin options.');
    } else if (pluginOptions.minValue === pluginOptions.maxValue) {
      pluginOptions.maxValue += pluginOptions.stepSize;
      console.warn(`Warning: maxValue is equal to minValue in plugin options. maxValue is now increased by stepSize (${pluginOptions.stepSize}).\nPlease check values that you passed to plugin options.`);
    }

    if (pluginOptions.value1 < pluginOptions.minValue) {
      pluginOptions.value1 = pluginOptions.minValue;
      console.warn('Warning: value1 < minValue in plugin options. value1 is now set to minValue.\nPlease check values that you passed to plugin options.');
    }

    if (pluginOptions.value2 > pluginOptions.maxValue) {
      pluginOptions.value2 = pluginOptions.maxValue;
      console.warn('Warning: value2 > maxValue in plugin options. value2 is now set to maxValue.\nPlease check values that you passed to plugin options.');
    }

    if (pluginOptions.value1 === pluginOptions.value2) {
      pluginOptions.value1 = pluginOptions.minValue;
      pluginOptions.value2 = pluginOptions.maxValue;
      console.warn('Warning: value1 and value2 are equal in plugin options. Values are now set to minValue and maxValue respectively.\nPlease check values that you passed to plugin options.');
    }

    if (pluginOptions.value1 > pluginOptions.value2) {
      [pluginOptions.value1, pluginOptions.value2] = [pluginOptions.value2, pluginOptions.value1];
      console.warn('Warning: value1 > value2 in plugin options. Values are now swapped.\nPlease check values that you passed to plugin options.');
    }

    const totalSliderRange = pluginOptions.maxValue - pluginOptions.minValue;

    if (pluginOptions.stepSize >= totalSliderRange) {
      console.warn(`Warning: stepSize (${pluginOptions.stepSize}) must be less that slider range (${totalSliderRange}). stepSize is now reseted to 10% of total slider range (${totalSliderRange * 0.1}).\nPlease check values that you passed to plugin options.`);
      pluginOptions.stepSize = totalSliderRange * 0.1;
    }

    const presenter = new SliderPresenter(this, pluginOptions);

    return presenter.publicMethods;
  },
  {
    options: {
      stepSize: 1,
      minValue: 0,
      maxValue: 500,
      value1: 100,
      value2: 300,
      isVertical: false,
      isInterval: true,
      showTip: true,
      showScale: true,
      showProgressBar: true,
    },
  },
);
