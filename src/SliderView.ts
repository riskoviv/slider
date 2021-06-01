import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';

class SliderView extends EventEmitter {
  $thisElem = $('<div class="slider"></div>');

  controlContainer = $('<div class="slider__control-container js-slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  }

  constructor(private pluginRootElem: JQuery<HTMLElement>) {
    super();
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(),
    };

    this.insertSubViewsIntoContainer();

    this.HTML.append(this.controlContainer);

    // this.subViews.sliderBase.HTML.addClass('some_class');
  }

  insertSubViewsIntoContainer = () => {
    Object.keys(this.subViews).forEach((subView) => {
      this.controlContainer.append(this.subViews[subView].$thisElem);
    });
  }

  render() {
    this.pluginRootElem.append(this.$thisElem);
    return this;
  }
}

export default SliderView;
