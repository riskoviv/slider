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

    this.publicMethods = this.model.publicMethods;

    this.view.render();

    this.model.on('stepSizeChanged', this.changeStepSize);
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }
}

export default SliderPresenter;
