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
    } = this.model.getOptions();

    this.view = new SliderView(
      this.pluginRootElem,
      {
        minValue,
        maxValue,
        stepSize,
      },
      this.model.allowedRealValues,
    );

    this.publicMethods = this.model.publicMethods;

    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('value1Changed', this.value1Changed);

    this.view.subViews.sliderHandle1.on('handle1ValueChange', this.handle1ValueChange);

    this.view.sliderScale.on('scaleValueSelect', this.scaleValueSelect);

    this.view.render(this.model.allowedRealValues.indexOf(value1));
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  private handle1ValueChange = (values: { left: number, index: number }) => {
    this.view.subViews.sliderTip1.setPosition(values.left);
    this.model.setValue1(values.index);
  }

  private value1Changed = (value1: number) => {
    this.view.subViews.sliderTip1.setValue(value1);
  }

  private scaleValueSelect = (value1Idx: number) => {
    this.view.subViews.sliderHandle1.setPositionAndCurrentValue(value1Idx);
  }
}

export default SliderPresenter;