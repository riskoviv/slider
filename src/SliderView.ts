import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';
import SliderScaleView from './subviews/SliderScaleView';
import SliderTipView from './subviews/SliderTipView';

class SliderView extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  controlContainer = $('<div class="slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  }

  sliderScale: ISliderSubView;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private bounds: HandleBounds,
    private allowedRealValues: number[],
  ) {
    super();

    this.$elem.append(this.controlContainer);
    this.insertSliderToPluginRootElem();
    this.createSubViews();
    this.insertSubViewsIntoContainer();
    this.$elem.append(this.sliderScale.$elem);
  }

  createSubViews() {
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(this.controlContainer.get()[0], this.bounds),
      sliderTip1: new SliderTipView(),
    };
    this.sliderScale = new SliderScaleView(
      this.subViews.sliderHandle1.allowedValues,
      this.allowedRealValues,
    );
  }

  insertSubViewsIntoContainer = () => {
    Object.values(this.subViews).forEach((subView) => {
      this.controlContainer.append(subView.$elem);
    });
  }

  insertSliderToPluginRootElem() {
    this.pluginRootElem.append(this.$elem);
  }

  translateRealToCSSValue = (realValue: number, minValue: number, maxValue: number) => {
    const percentValue = ((realValue - minValue) / (maxValue - minValue)) * 100;
    return percentValue;
  }

  fixValue = (value: number, minValue: number, maxValue: number) => {
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
  }

  render(value1: number, minValue: number, maxValue: number) {
    const fixedValue1 = this.fixValue(value1, minValue, maxValue);
    const CSSValue = this.translateRealToCSSValue(fixedValue1, minValue, maxValue);
    this.subViews.sliderHandle1.setPositionAndCurrentValue(CSSValue);
  }
}

export default SliderView;
