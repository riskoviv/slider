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
      .subViews.sliderHandle1.on('handle1MouseDown', this.handle1MouseDown)
      .on('handle1MouseMove', this.handle1MouseMove)
      .on('handle1MouseUp', this.handle1MouseUp);

    this.model.on('stepSizeChanged', this.changeStepSize);
  }

  changeStepSize = (stepSize: number) => {
    console.log(`stepSize was changed to ${stepSize}`);
    // this.view.changeStepSize(stepSize);
  }

  handle1MouseDown = () => {
    // this.model.
    console.log('down');
  }

  handle1MouseMove = () => {
    console.log('move');
  }

  handle1MouseUp = () => {
    console.log('up');
  }

}

export default SliderPresenter;
