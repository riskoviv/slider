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
    this.view = new SliderView(this.pluginRootElem);

    const {
      value1, minValue, maxValue, stepSize,
    } = this.pluginOptions;

    this.publicMethods = this.model.publicMethods;

    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('value1Changed', this.value1Changed);


    this.view.subViews.sliderHandle1.on('handleMoved', this.handle1MouseMove);

    this.view.render(value1, minValue, maxValue);
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  handle1MouseMove = (handle1Left: number) => {
    this.model.setValue1(handle1Left);
  }

  value1Changed = (value1: number) => {
    this.view.subViews.sliderTip.setValue(value1);
  }
}

export default SliderPresenter;
