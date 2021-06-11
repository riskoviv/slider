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

      .on('handleMouseUp', this.handle1MouseUp);
    this.view.subViews.sliderHandle1.on('handleValueSet', this.handle1Stopped)

    this.view.render(value1, minValue, maxValue);
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  handle1Stopped = (handle1Left: number) => {
    this.model.setValue1(handle1Left);
  }

  value1Changed = (value1: number) => {
    this.view.subViews.sliderTip.setValue(value1);
  }

  handle1MouseUp = () => {
    const { minValue, maxValue } = this.model.getOptions();
    this.view.subViews.sliderHandle1.setHandlePosition(this.view.translateRealToCSSValue(
      this.model.getOptions().value1,
      minValue,
      maxValue,
    ));
  }
}

export default SliderPresenter;
