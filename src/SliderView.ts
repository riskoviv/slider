import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';
import SliderTipView from './subviews/SliderTipView';

class SliderView extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  controlContainer = $('<div class="slider__control-container js-slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  }

  constructor(private pluginRootElem: JQuery<HTMLElement>, private bounds: HandleBounds) {
    super();

    this.$elem.append(this.controlContainer);
    this.insertSliderToPluginRootElem();
    this.createSubViews();
    this.insertSubViewsIntoContainer();
    this.$elem.prepend(this.subViews.sliderTip.$elem);
  }

  createSubViews() {
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(this.controlContainer.get()[0]),
      sliderTip: new SliderTipView(),
    };
  }

  insertSubViewsIntoContainer = () => {
    this.controlContainer.append(
      this.subViews.sliderBase.$elem,
      this.subViews.sliderHandle1.$elem,
    );
  }

  insertSliderToPluginRootElem() {
    this.pluginRootElem.append(this.$elem);
  }

  translateRealToCSSValue = (realValue: number, minValue: number, maxValue: number) => {
    const percentValue = (realValue - minValue) / (maxValue - minValue);
    const CSSValue = Math.round(this.controlContainer.get()[0].offsetWidth * percentValue);
    return CSSValue;
  }

  fixValue = (value: number, minValue: number, maxValue: number) => {
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
  }

  render(value1: number, minValue: number, maxValue: number) {
    const fixedValue1 = this.fixValue(value1, minValue, maxValue);
    const CSSValue = this.translateRealToCSSValue(fixedValue1, minValue, maxValue);
    this.subViews.sliderHandle1.setHandlePosition(CSSValue);
    this.subViews.sliderTip.setValue(fixedValue1);
  }
}

export default SliderView;
