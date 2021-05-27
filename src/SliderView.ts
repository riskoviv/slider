import $ from 'jquery';
import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';

class SliderView extends EventEmitter {

  private subViews: {
    [subViewName: string]: ISliderSubView;
  }

  constructor(private pluginRootElem: JQuery<HTMLElement>) {
    super();
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(),
      sliderHandle2: new SliderHandleView(),
    };

    Object.keys(this.subViews).forEach((subView) => {
      this.HTML.append(this.subViews[subView].HTML);
    });
  }

  }
}

export default SliderView;
