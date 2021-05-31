import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';

class SliderView extends EventEmitter {
  HTML = $('<div class="slider"></div>');

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


    // this.subViews.sliderBase.HTML.addClass('some_class');
  }

  insertSubViewsIntoContainer = () => {
    Object.keys(this.subViews).forEach((subView) => {
      this.controlContainer.append(this.subViews[subView].HTML);
    });
  }

  render() {
    this.pluginRootElem.append(this.HTML);
  }
}

export default SliderView;
