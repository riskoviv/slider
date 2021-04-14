/* eslint-disable no-undef */
import SliderModel from './model/sliderModel';
import SliderView from './views/sliderView';
import SliderPresenter from './presenter/sliderPresenter';
import './styles/styles.scss';

(($) => {
  const model = new SliderModel();
  const view = new SliderView();
  const presenter = new SliderPresenter(model, view);
})(jQuery);
