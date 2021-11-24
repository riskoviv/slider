import SliderModel from './SliderModel';
import SliderView from './SliderView';

class SliderPresenter {
  private model: SliderModel;

  private view: SliderView;

  $pluginElem: JQuery<HTMLElement>;

  publicMethods: ISliderPluginPublicMethods;

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

    this.$pluginElem = this.view.$elem;

    this.publicMethods = this.model.publicMethods;

    this.bindEventListeners();

    this.view.render(
      this.model.allowedRealValues.indexOf(value1),
      this.model.allowedRealValues.indexOf(value2),
    );
  }

  private changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
  }

  private toggleVerticalState = (isVertical: boolean) => {

  }

  private retrieveStateOptions = () => {
    this.pluginStateOptions = this.model.getStateOptions();
  }

  private bindEventListeners() {
    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('isVerticalChanged', this.toggleVerticalState);

    if (this.pluginStateOptions.showTip) {
      this.model.on('valueChanged', this.changeTipValue);
    }

    [this.view.subViews.sliderHandle1, this.view.subViews.sliderHandle2].forEach((sliderHandle) => {
      sliderHandle?.on('handleValueChange', this.handleValueChange);
      if (this.pluginStateOptions.isInterval) {
        sliderHandle?.on('getOtherHandlePosition', this.receiveAndSubmitOtherHandlePosition);
      }
    });

    if (this.pluginStateOptions.showScale) {
      this.view.sliderScale.on('scaleValueSelect', this.scaleValueSelect);
    }
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
    if (this.pluginStateOptions.showProgressBar) {
      this.view.subViews.sliderProgress.updateProgressSize(
        values.handleNumber,
        values.position,
      );
    }
    this.model.setHandlePos(values.handleNumber, values.position);
    this.model.setValue(values.handleNumber, values.index);
  }

  private changeTipValue = (values: { number: 1 | 2, value: number }) => {
    this.view.subViews[`sliderTip${values.number}`].setValue(values.value);
  }

  private findClosestHandle(position: number): 1 | 2 {
    const handle1Pos = this.model.getHandlePos(1);
    const handle2Pos = this.model.getHandlePos(2);

    if (Math.abs(position - handle1Pos) < Math.abs(position - handle2Pos)) {
      return 1;
    }

    if (Math.abs(position - handle1Pos) > Math.abs(position - handle2Pos)) {
      return 2;
    }

    return 1;
  }

  private scaleValueSelect = (position: number) => {
    if (this.pluginStateOptions.isInterval) {
      const handleNumber = this.findClosestHandle(position);
      this.view.subViews[`sliderHandle${handleNumber}`].setPositionAndCurrentValue(position);
    } else {
      this.view.subViews.sliderHandle1.setPositionAndCurrentValue(position);
    }
  }

  private receiveAndSubmitOtherHandlePosition = (handleNumber: 1 | 2) => {
    this.view.subViews[`sliderHandle${handleNumber}`].otherHandlePosition = this.model.getOptions()[`handle${handleNumber === 1 ? 2 : 1}Pos`];
  }
}

export default SliderPresenter;
