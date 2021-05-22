/* eslint-disable no-undef */
import $ from 'jquery';
import SliderModel from './SliderModel';
import SliderView from './SliderView';
import SliderPresenter from './SliderPresenter';
import './styles/styles.scss';

$.fn.sliderPlugin = Object.assign<ISliderPluginFunction, ISliderPluginGlobalOptions>(
  function sliderPlugin(this: JQuery, options: ISliderPluginOptions): JQuery {
    const pluginOptions = $.extend({}, $.fn.sliderPlugin.options, options);
    const pluginStyles = $.extend({}, $.fn.sliderPlugin.options.styles, options.styles);
    const model = new SliderModel(pluginOptions);
    const view = new SliderView({ thisElement: this });
    const presenter = new SliderPresenter(model, view, this);

    function applyStyles(this: JQuery<HTMLElement>) {
      Object.keys(pluginStyles).forEach((style) => {
        this.css(style, pluginStyles[style]);
      });
    }

    applyStyles.call(this);

    return this;
  },
  {
    options: {
      styles: {
        'background-color': 'black',
      },
    },
  },
);
