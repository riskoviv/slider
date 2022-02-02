import EventEmitter from './EventEmitter';
import BaseView from './subviews/BaseView';
import HandleView from './subviews/HandleView';
import ScaleView from './subviews/ScaleView';
import TipView from './subviews/TipView';
import ProgressView from './subviews/ProgressView';

class View extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  $controlContainer = $('<div class="slider__control-container"></div>');

  subViews: {
    [subViewName: string]: IView;
  } = {};

  handleParams: HandleParams;

  sliderScale?: IScaleView;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private bounds: HandleBounds,
    private allowedRealValues: number[],
    private stateOptions: IPluginStateOptions,
  ) {
    super();

    if (this.stateOptions.isVertical) {
      this.$elem.addClass('slider_vertical');
    }

    if (this.stateOptions.isInterval) {
      this.$elem.addClass('slider_interval');
    }

    this.handleParams = {
      positions: { 1: 0, 2: 100 },
      stepSizeInPercents: 10,
      halfStep: 5,
      allowedPositions: [],
      isInterval: this.stateOptions.isInterval,
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
    const positionAccuracy = (totalSliderRange / this.bounds.stepSize).toFixed(0).length - 2;
    this.handleParams.stepSizeInPercents = (this.bounds.stepSize / totalSliderRange) * 100;
    this.handleParams.halfStep = this.handleParams.stepSizeInPercents / 2;

    for (let i = 0; i <= 100; i += this.handleParams.stepSizeInPercents) {
      this.handleParams.allowedPositions.push(
        Number(i.toFixed(positionAccuracy < 1 ? 1 : positionAccuracy)),
      );
    }

    if (this.handleParams.allowedPositions[this.handleParams.allowedPositions.length - 1] !== 100) {
      this.handleParams.allowedPositions.push(100);
    }
  }

  private createSubViews() {
    this.subViews = {
      sliderBase: new BaseView(),
      sliderHandle1: new HandleView(
        this.handleParams,
        1,
        this.stateOptions.isVertical,
      ),
    };

    if (this.stateOptions.showTip) {
      this.subViews.sliderTip1 = new TipView(1);
    }

    if (this.stateOptions.isInterval) {
      this.subViews.sliderHandle2 = new HandleView(
        this.handleParams,
        2,
        this.stateOptions.isVertical,
      );
      if (this.stateOptions.showTip) {
        this.subViews.sliderTip2 = new TipView(2);
      }
    }

    if (this.stateOptions.showScale) {
      this.sliderScale = new ScaleView(
        this.handleParams.allowedPositions,
        this.allowedRealValues,
        this.stateOptions.isVertical,
      );
    }

    if (this.stateOptions.showProgressBar) {
      this.subViews.sliderProgress = new ProgressView(
        this.stateOptions.isInterval,
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

export default View;
