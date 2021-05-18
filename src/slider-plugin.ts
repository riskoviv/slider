/* eslint-disable no-undef */
import $ from 'jquery';
import SliderModel from './model/SliderModel';
import SliderView from './views/SliderView';
import SliderPresenter from './presenter/SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderInit (this: JQuery, options: ISliderPluginOptions): JQuery {
    options = $.extend({}, $.fn.sliderPlugin.options, options);
  },
  {
    options: {
      styles: {
        'background-color': 'black',
      },
    },
  },
);
