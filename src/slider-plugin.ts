import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options?: ISliderPluginOptions): Object {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    const warnMsgEnd = '\nPlease check values that you passed to plugin options';

    if (pluginOptions.stepSize <= 0) {
      pluginOptions.stepSize = 10;
      console.warn(`Warning: stepSize ≤ 0 in plugin options. stepSize is reset to default value (10).${warnMsgEnd}`);
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

    const presenter = new SliderPresenter(this, pluginOptions);

    return presenter.publicMethods;
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
