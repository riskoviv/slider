import EventEmitter from './EventEmitter';
import BaseView from './subviews/BaseView';
import ThumbView from './subviews/ThumbView';
import ScaleView from './subviews/ScaleView';
import TipView from './subviews/TipView';
import ProgressView from './subviews/ProgressView';

class View extends EventEmitter {
  $elem = $('<div class="slider"></div>');

  $controlContainer = $('<div class="slider__control-container"></div>');

  subViews: {
    [subViewName: string]: ISubView;
  } = {};

  thumbParams: ViewValues;

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

    this.thumbParams = {
      positions: { 1: 0, 2: 100 },
      stepSizeInPercents: 10,
      halfStepInPercents: 5,
      allowedPositions: [],
      isInterval: this.stateOptions.isInterval,
    };
    this.$elem.append(this.$controlContainer);
    this.insertSliderToPluginRootElem();
    this.createAllowedPositionsArr();
    this.createSubViews();
  }

  render(index1: number, index2: number): void {
    this.insertSubViewsIntoContainer();

    const thumb1Position = this.thumbParams.allowedPositions[index1];

    if (this.subViews.sliderHandle1.setPositionAndCurrentValue !== undefined) {
      this.subViews.sliderHandle1.setPositionAndCurrentValue(thumb1Position, false);
    }

    if (this.stateOptions.isInterval) {
      const thumb2Position = this.thumbParams.allowedPositions[index2];

      if (this.subViews.sliderHandle2.setPositionAndCurrentValue !== undefined) {
        this.subViews.sliderHandle2.setPositionAndCurrentValue(thumb2Position, false);
      }
    }
  }


  private createSubViews() {
    this.subViews = {
      sliderBase: new BaseView(),
      sliderHandle1: new ThumbView(
        this.thumbParams,
        1,
        this.stateOptions.isVertical,
      ),
    };

    if (this.stateOptions.showTip) {
      this.subViews.sliderTip1 = new TipView(1);
    }

    if (this.stateOptions.isInterval) {
      this.subViews.sliderHandle2 = new ThumbView(
        this.thumbParams,
        2,
        this.stateOptions.isVertical,
      );
      if (this.stateOptions.showTip) {
        this.subViews.sliderTip2 = new TipView(2);
      }
    }

    if (this.stateOptions.showScale) {
      this.sliderScale = new ScaleView(
        this.thumbParams.allowedPositions,
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
