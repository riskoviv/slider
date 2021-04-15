/* eslint-disable no-undef */
import SliderModel from './model/SliderModel';
import SliderView from './views/SliderView';
import SliderPresenter from './presenter/SliderPresenter';
import './styles/styles.scss';

(($) => {
  const model = new SliderModel();
  const view = new SliderView();
  const presenter = new SliderPresenter(model, view);
})(jQuery);
