/* eslint-disable no-undef */
import $ from 'jquery';
import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): Object {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    const presenter = new SliderPresenter(this, pluginOptions);

    return presenter.publicMethods;
  },
  {
    options: {
      stepSize: 10,
      minValue: 0,
      maxValue: 10,
      isVertical: false,
      isInterval: false,
      showValueHint: false,
      showScale: false,
      showProgressBar: false,
    },
  },
);
