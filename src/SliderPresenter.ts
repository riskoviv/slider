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

    this.view.on('viewInit', this.getOptionsFromModel);
    this.view.on('sliderElementClicked', this.changeSliderColor);
  }

  getOptionsFromModel() {
    this.view.pluginOptions = this.model.getOptions();
  }

  changeSliderColor = (target: HTMLDivElement) => {
    this.view.changeSliderColor(target);
    console.log(this.model.getOptions());
  }
}

export default SliderPresenter;
