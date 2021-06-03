import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): Object | null {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    try {
      if (pluginOptions.minValue > pluginOptions.maxValue) {
        const minMaxError = new Error('minValue must be less that maxValue!');
        minMaxError.name = 'MinMaxError';
        throw minMaxError;
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
      stepSize: 10,
      minValue: -100,
      maxValue: 100,
      value1: 4,
      value2: 6,
      isVertical: false,
      isInterval: false,
      showValueHint: false,
      showScale: false,
      showProgressBar: false,
    },
  },
);
