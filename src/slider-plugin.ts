/* eslint-disable no-undef */
import $ from 'jquery';
import SliderModel from './SliderModel';
import SliderView from './SliderView';
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
      isInterval: false,
      isVertical: false,
      stepSize: 10,
    },
  },
);
