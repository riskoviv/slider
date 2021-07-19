import SliderModel from './SliderModel';
import SliderView from './SliderView';

class SliderPresenter {
  private model: SliderModel;

  private view: SliderView;

  publicMethods: Object;

  pluginStateOptions: ISliderPluginStateOptions;

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private pluginOptions: ISliderPluginOptions,
  ) {
    this.model = new SliderModel(this.pluginOptions);

    const {
      value1, value2, minValue, maxValue, stepSize,
    } = this.model.getOptions();

    this.retrieveStateOptions();

    this.view = new SliderView(
      this.pluginRootElem,
      {
        minValue,
        maxValue,
        stepSize,
      },
      this.model.allowedRealValues,
      this.pluginStateOptions,
    );

    this.publicMethods = this.model.publicMethods;

    this.model.on('stepSizeChanged', this.changeStepSize);

    if (this.pluginStateOptions.showTip) {
      this.model.on('valueChanged', this.valueChanged);
    }

    [this.view.subViews.sliderHandle1, this.view.subViews.sliderHandle2].forEach((sliderHandle) => {
      sliderHandle?.on('handleValueChange', this.handleValueChange);
      if (this.pluginStateOptions.isInterval) {
        sliderHandle?.on('getOtherHandlePosition', this.receiveAndSubmitOtherHandlePosition);
      }
    });

    this.view.render(
      this.model.allowedRealValues.indexOf(value1),
      this.model.allowedRealValues.indexOf(value2),
    );

    if (this.pluginStateOptions.showScale) {
      this.view.sliderScale.on('scaleValueSelect', this.scaleValueSelect);
    }
  }

  changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  private retrieveStateOptions = () => {
    this.pluginStateOptions = this.model.getStateOptions();
  }

  private handleValueChange = (
    values: {
      handleNumber: 1 | 2,
      position: number,
      index: number
    },
  ) => {
    if (this.pluginStateOptions.showTip) {
      this.view.subViews[`sliderTip${values.handleNumber}`].setPosition(values.position);
    }
    this.model.setHandlePos(values.handleNumber, values.position);
    this.model.setValue(values.handleNumber, values.index);
  }

  private valueChanged = (values: { number: 1 | 2, value: number }) => {
    this.view.subViews[`sliderTip${values.number}`].setValue(values.value);
  }

  private scaleValueSelect = (value1Idx: number) => {
    this.view.subViews.sliderHandle1.setPositionAndCurrentValue(value1Idx);
  }

  private receiveAndSubmitOtherHandlePosition = (handleNumber: 1 | 2) => {
    this.view.subViews[`sliderHandle${handleNumber}`].otherHandlePosition = this.model.getOptions()[`handle${handleNumber === 1 ? 2 : 1}Pos`];
  }
}

export default SliderPresenter;
