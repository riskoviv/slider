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

    this.view.on('sliderElementClicked', this.changeSliderColor);

    this.model.on('stepSizeChanged', this.changeStepSize);
  }

  changeSliderColor = (target: HTMLDivElement) => {
    this.view.changeSliderColor(target);
    console.log(this.model.getOptions());
  }

  changeStepSize = () => {

  }
}

export default SliderPresenter;
