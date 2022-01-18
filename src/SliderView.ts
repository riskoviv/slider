import EventEmitter from './EventEmitter';
import SliderBaseView from './subviews/SliderBaseView';
import SliderHandleView from './subviews/SliderHandleView';
import SliderScaleView from './subviews/SliderScaleView';
import SliderTipView from './subviews/SliderTipView';
import SliderProgressView from './subviews/SliderProgressView';

class SliderView extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  $controlContainer = $('<div class="slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISliderSubView;
  } = {};

  handleParams: HandleParams;

  sliderScale?: ISliderScaleView;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private bounds: HandleBounds,
    private allowedRealValues: number[],
    private stateOptions: ISliderPluginStateOptions,
    private stepPrecision: number,
  ) {
    super();

    if (this.stateOptions.isVertical) {
      this.$elem.addClass('slider_vertical');
    }

    this.handleParams = {
      stepSizeInPercents: 10,
      halfStep: 5,
      allowedPositions: [],
      isInterval: this.stateOptions.isInterval,
      stepPrecision,
    };
    this.$elem.append(this.$controlContainer);
    this.insertSliderToPluginRootElem();
    this.createAllowedPositionsArr();
    this.createSubViews();
  }

  render(index1: number, index2: number) {
    this.insertSubViewsIntoContainer();

    const handle1Position = this.handleParams.allowedPositions[index1];

    if (this.subViews.sliderHandle1.setPositionAndCurrentValue !== undefined) {
      this.subViews.sliderHandle1.setPositionAndCurrentValue(handle1Position, false);
    }

    if (this.stateOptions.isInterval) {
      const handle2Position = this.handleParams.allowedPositions[index2];

      if (this.subViews.sliderHandle2.setPositionAndCurrentValue !== undefined) {
        this.subViews.sliderHandle2.setPositionAndCurrentValue(handle2Position, false);
      }
    }
  }

  private createAllowedPositionsArr = () => {
    const totalSliderRange = this.bounds.maxValue - this.bounds.minValue;
    this.handleParams.stepSizeInPercents = (this.bounds.stepSize / totalSliderRange) * 100;
    this.handleParams.halfStep = this.handleParams.stepSizeInPercents / 2;

    for (let i = 0; i <= 100; i += this.handleParams.stepSizeInPercents) {
      this.handleParams.allowedPositions.push(Number(i.toFixed(this.stepPrecision)));
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
        this.stateOptions.isVertical,
      ),
    };

    if (this.stateOptions.showTip) {
      this.subViews.sliderTip1 = new SliderTipView(this.stateOptions.isVertical);
    }

    if (this.stateOptions.isInterval) {
      this.subViews.sliderHandle2 = new SliderHandleView(
        this.handleParams,
        2,
        this.stateOptions.isVertical,
      );
      if (this.stateOptions.showTip) {
        this.subViews.sliderTip2 = new SliderTipView(this.stateOptions.isVertical);
      }
    }

    if (this.stateOptions.showScale) {
      this.sliderScale = new SliderScaleView(
        this.handleParams.allowedPositions,
        this.allowedRealValues,
        this.stateOptions.isVertical,
      );
    }

    if (this.stateOptions.showProgressBar) {
      this.subViews.sliderProgress = new SliderProgressView(
        this.stateOptions.isInterval,
        this.stateOptions.isVertical,
      );
      this.subViews.sliderBase.$elem.append(this.subViews.sliderProgress.$elem);
    }
  }

  private insertSubViewsIntoContainer = () => {
    Object.values(this.subViews).forEach((subView) => {
      if (subView !== this.subViews.sliderProgress) {
        this.$controlContainer.append(subView.$elem);
      }
    });

    if (this.stateOptions.showScale && this.sliderScale !== undefined) {
      this.$elem.append(this.sliderScale.$elem);
    }
  }

  private insertSliderToPluginRootElem() {
    this.pluginRootElem.append(this.$elem);
  }
}

export default SliderView;
