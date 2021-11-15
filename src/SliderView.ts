import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';
import SliderScaleView from './subviews/SliderScaleView';
import SliderTipView from './subviews/SliderTipView';

class SliderView extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  $controlContainer = $('<div class="slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  };

  handleParams: HandleParams;

  sliderScale: ISliderSubView;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private bounds: HandleBounds,
    private allowedRealValues: number[],
    private options: ISliderPluginStateOptions,
  ) {
    super();

    if (this.options.isVertical) {
      this.$elem.addClass('slider_vertical');
    }

    this.handleParams = {};
    this.handleParams.isInterval = this.options.isInterval;
    this.$elem.append(this.$controlContainer);
    this.insertSliderToPluginRootElem();
    this.createAllowedPositionsArr();
    this.createSubViews();
  }

  render(index1: number, index2: number) {
    this.insertSubViewsIntoContainer();

    const handle1LeftValue = this.handleParams.allowedPositions[index1];
    this.subViews.sliderHandle1.setPositionAndCurrentValue(handle1LeftValue);

    if (this.options.isInterval) {
      const handle2LeftValue = this.handleParams.allowedPositions[index2];
      this.subViews.sliderHandle2.setPositionAndCurrentValue(handle2LeftValue);
    }
  }

  private createAllowedPositionsArr = () => {
    const totalSliderRange = this.bounds.maxValue - this.bounds.minValue;
    this.handleParams.stepSizeInPercents = (this.bounds.stepSize / totalSliderRange) * 100;
    this.handleParams.halfStep = this.handleParams.stepSizeInPercents / 2;
    this.handleParams.allowedPositions = [];

    for (let i = 0; i <= 100; i += this.handleParams.stepSizeInPercents) {
      this.handleParams.allowedPositions.push(Number(i.toFixed(3)));
    }

    if (this.handleParams.allowedPositions[this.handleParams.allowedPositions.length - 1] !== 100) {
      this.handleParams.allowedPositions.push(100);
    }
  }

  private createSubViews() {
    this.subViews = {
      sliderBase: new SliderBaseView(),
      sliderHandle1: new SliderHandleView(
        this.handleParams,
        1,
        this.options.isVertical,
      ),
    };

    if (this.options.showTip) {
      this.subViews.sliderTip1 = new SliderTipView(this.options.isVertical);
    }

    if (this.options.isInterval) {
      this.subViews.sliderHandle2 = new SliderHandleView(
        this.handleParams,
        2,
        this.options.isVertical,
      );
      if (this.options.showTip) {
        this.subViews.sliderTip2 = new SliderTipView(this.options.isVertical);
      }
    }

    if (this.options.showScale) {
      this.sliderScale = new SliderScaleView(
        this.handleParams.allowedPositions,
        this.allowedRealValues,
        this.options.isVertical,
      );
    }
  }

  private insertSubViewsIntoContainer = () => {
    Object.values(this.subViews).forEach((subView) => {
      this.$controlContainer.append(subView.$elem);
    });

    if (this.options.showScale) {
      this.$elem.append(this.sliderScale.$elem);
    }
  }

  private insertSliderToPluginRootElem() {
    this.pluginRootElem.append(this.$elem);
  }
}

export default SliderView;
