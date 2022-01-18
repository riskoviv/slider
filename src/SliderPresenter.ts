import SliderModel from './SliderModel';
import SliderView from './SliderView';

class SliderPresenter {
  readonly view: SliderView;

  readonly $pluginElem: JQuery<HTMLElement>;

  readonly publicMethods: ISliderPluginPublicMethods;

  readonly pluginStateOptions: ISliderPluginStateOptions;

  readonly allowedRealValues: number[];

  readonly allowedPositions: number[];

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private readonly model: SliderModel,
  ) {
    const {
      value1, value2, minValue, maxValue, stepSize,
    } = model.getOptions();

    this.pluginStateOptions = this.getStateOptions();
    this.allowedRealValues = model.allowedRealValues;

    this.view = new SliderView(
      this.pluginRootElem,
      {
        minValue,
        maxValue,
        stepSize,
      },
      this.allowedRealValues,
      this.pluginStateOptions,
    );

    this.allowedPositions = this.view.handleParams.allowedPositions;

    this.$pluginElem = this.view.$elem;

    this.publicMethods = model.publicMethods;

    this.bindEventListeners();

    this.view.render(
      this.allowedRealValues.indexOf(value1),
      this.allowedRealValues.indexOf(value2),
    );
  }

  private changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
    console.warn('Method is not implemented yet!');
  }

  private toggleVerticalState = (isVertical: boolean) => {
    console.warn('Method is not implemented yet!');
  }

  private getStateOptions = () => this.model.getStateOptions();

  private bindEventListeners() {
    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('isVerticalChanged', this.toggleVerticalState);

    if (this.pluginStateOptions.showTip) {
      this.model.on('valueChanged', this.changeTipValue);
    }

    [this.view.subViews.sliderHandle1, this.view.subViews.sliderHandle2]
      .forEach((sliderHandle) => {
        sliderHandle?.on('handleValueChange', this.handleValueChange);
      });

    if (this.pluginStateOptions.showScale) {
      this.view.sliderScale!.on('scaleValueSelect', this.scaleValueSelect);
    }
  }

  private handleValueChange = (
    values: {
      handleNumber: 1 | 2,
      index: number
    },
  ) => {
    const position = this.allowedPositions[values.index];

    if (this.pluginStateOptions.showTip) {
      this.view.subViews[`sliderTip${values.handleNumber}`].setPosition!(position);
    }
    if (this.pluginStateOptions.showProgressBar) {
      this.view.subViews.sliderProgress.updateProgressSize!(
        values.handleNumber,
        position,
      );
    }
    this.model.setValue(values.handleNumber, values.index);
  }

  private changeTipValue = (values: { number: 1 | 2, value: number }) => {
    this.view.subViews[`sliderTip${values.number}`].setValue!(values.value);
  }

  private findClosestHandle(valueIndex: number): 1 | 2 {
    const handle1Index = this.model.getValueIndex(1);
    const handle2Index = this.model.getValueIndex(2);

    if (Math.abs(valueIndex - handle1Index) < Math.abs(valueIndex - handle2Index)) {
      return 1;
    }

    if (Math.abs(valueIndex - handle1Index) > Math.abs(valueIndex - handle2Index)) {
      return 2;
    }

    return 1;
  }

  private scaleValueSelect = (valueIndex: number) => {
    if (this.pluginStateOptions.isInterval) {
      const handleNumber = this.findClosestHandle(valueIndex);
      this.view.subViews[`sliderHandle${handleNumber}`].setPositionAndCurrentValue!(
        this.allowedPositions[valueIndex], false,
      );
    } else {
      this.view.subViews.sliderHandle1.setPositionAndCurrentValue!(
        this.allowedPositions[valueIndex], false,
      );
    }
  }
}

export default SliderPresenter;
