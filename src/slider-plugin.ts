/* eslint-disable no-undef */
import $ from 'jquery';
import SliderModel from './SliderModel';
import SliderView from './SliderView';
import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): JQuery {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    const model = new SliderModel(pluginOptions);
    const view = new SliderView();
    // eslint-disable-next-line no-unused-vars
    const presenter = new SliderPresenter(model, view);

    return this;
  },
  {
    options: {},
  },
);
