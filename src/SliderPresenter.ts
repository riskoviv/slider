import SliderModel from './SliderModel';
import SliderView from './SliderView';

class SliderPresenter {
  constructor(
    private model: SliderModel,
    private view: SliderView,
  ) {
    view.on('firstSliderClicked', this.changeSliderColor);
  }

  changeSliderColor = (target: HTMLDivElement) => {
    SliderView.changeSliderColor(target);
  }
}

export default SliderPresenter;
