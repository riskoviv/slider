import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): Object | null {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    try {
      if (pluginOptions.minValue >= pluginOptions.maxValue) {
        const minMaxError = new Error('minValue must be less that maxValue!');
        minMaxError.name = 'MinMaxError';
        throw minMaxError;
      }

      if (pluginOptions.stepSize <= 0) {
        const invalidStepError = new Error('stepSize must be > 0');
        invalidStepError.name = 'InvalidStepError';
        throw invalidStepError;
      }

      const totalSliderRange = pluginOptions.maxValue - pluginOptions.minValue;

      if (pluginOptions.stepSize > totalSliderRange) {
        pluginOptions.stepSize = totalSliderRange;
      }

      const presenter = new SliderPresenter(this, pluginOptions);
      return presenter.publicMethods;
    } catch (e) {
      console.error(e);
    }
    return null;
  },
  {
    options: {
      stepSize: 15,
      minValue: 10,
      maxValue: 100,
      value1: 20,
      value2: 60,
      isVertical: false,
      isInterval: false,
      showTip: true,
      showScale: true,
      showProgressBar: false,
    },
  },
);
