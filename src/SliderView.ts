import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';

class SliderView extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  controlContainer = $('<div class="slider__control-container js-slider__control-container"></div>');

  tip = $('<div class="slider__tip js-slider__tip"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  }

  constructor(private pluginRootElem: JQuery<HTMLElement>) {
    super();
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(this.controlContainer.get()[0]),
    };

    this.insertSubViewsIntoContainer();

      this.tip,
    this.$elem.append(
      this.controlContainer,
    );

    // this.subViews.sliderBase.HTML.addClass('some_class');
  }

  insertSubViewsIntoContainer = () => {
    Object.keys(this.subViews).forEach((subView) => {
      this.controlContainer.append(this.subViews[subView].$elem);
    });
  }

  render() {
    this.pluginRootElem.append(this.$elem);
    return this;
  }
}

export default SliderView;
