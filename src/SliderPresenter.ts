import SliderModel from './SliderModel';
import SliderView from './SliderView';

class SliderPresenter {
  private model: SliderModel;

  private view: SliderView;

  publicMethods: Object;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private pluginOptions: ISliderPluginOptions,
  ) {
    this.model = new SliderModel(this.pluginOptions);

    const {
      value1, minValue, maxValue, stepSize,
    } = this.pluginOptions;

    this.view = new SliderView(
      this.pluginRootElem,
      {
        minValue,
        maxValue,
        stepSize,
      },
    );

    this.publicMethods = this.model.publicMethods;

    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('value1Changed', this.value1Changed);

    this.view.subViews.sliderHandle1.on('handle1ValueChange', this.handle1ValueChange);

    this.view.sliderScale.on('scaleValueSelect', this.scaleValueSelect);

    this.view.render(value1, minValue, maxValue);
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  private handle1ValueChange = (left: number) => {
    this.view.subViews.sliderTip1.setPosition(left);
    this.model.setValue1(left);
  }

  private value1Changed = (value1: number) => {
    this.view.subViews.sliderTip1.setValue(value1);
  }

  private scaleValueSelect = (value1Idx: number) => {
    this.view.subViews.sliderHandle1.setPositionAndCurrentValue(value1Idx);
  }
}

export default SliderPresenter;
