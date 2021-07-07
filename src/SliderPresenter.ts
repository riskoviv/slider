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
      value1, value2, minValue, maxValue, stepSize,
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
      .on('value1Changed', this.value1Changed)
      .on('value2Changed', this.value2Changed);

    this.view.subViews.sliderHandle1.on('handle1ValueChange', this.handle1ValueChange)
      .on('getOtherHandlePosition', this.receiveAndSubmitOtherHandlePositionToHandle1);

    this.view.subViews.sliderHandle2.on('handle2ValueChange', this.handle2ValueChange)
      .on('getOtherHandlePosition', this.receiveAndSubmitOtherHandlePositionToHandle2);

    this.view.sliderScale.on('scaleValueSelect', this.scaleValueSelect);

    this.view.render(
      this.model.allowedRealValues.indexOf(value1),
      this.model.allowedRealValues.indexOf(value2),
    );
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  private handle1ValueChange = (values: { left: number, index: number }) => {
    this.view.subViews.sliderTip1.setPosition(values.left);
    this.model.setHandle1Pos(values.left);
    this.model.setValue1(values.index);
  }

  private handle2ValueChange = (values: { left: number, index: number }) => {
    this.view.subViews.sliderTip2.setPosition(values.left);
    this.model.setHandle2Pos(values.left);
    this.model.setValue2(values.index);
  }

  private value1Changed = (value1: number) => {
    this.view.subViews.sliderTip1.setValue(value1);
  }

  private value2Changed = (value2: number) => {
    this.view.subViews.sliderTip2.setValue(value2);
  }

  private scaleValueSelect = (value1Idx: number) => {
    this.view.subViews.sliderHandle1.setPositionAndCurrentValue(value1Idx);
  }

  private receiveAndSubmitOtherHandlePositionToHandle1 = () => {
    this.view.subViews.sliderHandle1.otherHandlePosition = this.model.getOptions().handle2Pos;
  }

  private receiveAndSubmitOtherHandlePositionToHandle2 = () => {
    this.view.subViews.sliderHandle2.otherHandlePosition = this.model.getOptions().handle1Pos;
  }
}

export default SliderPresenter;
