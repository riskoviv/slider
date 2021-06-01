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

    this.view.render()
      .subViews.sliderHandle1.on('handle1MouseMove', this.handle1MouseMove);

    this.model.on('stepSizeChanged', this.changeStepSize);
  }

  changeStepSize = (stepSize: number) => {
    console.log(`stepSize was changed to ${stepSize}`);
    // this.view.changeStepSize(stepSize);
  }

  }

  handle1MouseMove = () => {
    console.log('move');
  }
}

export default SliderPresenter;
