import Model from './Model';
import View from './View_old';
import ViewNew from './View';

class Presenter {
  readonly view: View;

  readonly publicMethods: IPluginPublicMethods;

  readonly pluginStateOptions: IPluginStateOptions;

  readonly allowedRealValues: number[];

  readonly allowedPositions: number[];

  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
    private readonly model: Model,
  ) {
    const {
      value1, value2, minValue, maxValue, stepSize,
    } = model.getOptions();

    this.pluginStateOptions = this.getStateOptions();
    this.allowedRealValues = model.allowedRealValues;
    this.view = new View(
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

    this.publicMethods = model.publicMethods;

    this.bindEventListeners();

    this.view.render(
      this.allowedRealValues.indexOf(value1),
      this.allowedRealValues.indexOf(value2),
    );
  }

  private changeStepSize = (options: { stepSize: number }) => {
    // this.view.changeStepSize(stepSize);
    console.warn('Method is not implemented yet!');
  }

  private toggleVerticalState = (options: { isVertical: boolean }) => {
    console.warn('Method is not implemented yet!');
  }

  private getStateOptions() {
    this.model.getStateOptions();
  }

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
      this.view.sliderScale?.on('scaleValueSelect', this.scaleValueSelect);
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
      this.view.subViews[`sliderTip${values.handleNumber}`].setPosition?.(position);
    }
    if (this.pluginStateOptions.showProgressBar) {
      this.view.subViews.sliderProgress.updateProgressSize?.(
        values.handleNumber,
        position,
      );
    }
    this.model.setValue(values.handleNumber, values.index);
  }

  private changeTipValue = (values: { number: 1 | 2, value: number }) => {
    this.view.subViews[`sliderTip${values.number}`].setValue?.(values.value);
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

  private scaleValueSelect = (options: { index: number }) => {
    if (this.pluginStateOptions.isInterval) {
      const handleNumber = this.findClosestHandle(options.index);
      this.view.subViews[`sliderHandle${handleNumber}`].setPositionAndCurrentValue?.(
        this.allowedPositions[options.index], false,
      );
    } else {
      this.view.subViews.sliderHandle1.setPositionAndCurrentValue?.(
        this.allowedPositions[options.index], false,
      );
    }
  }
}

export default Presenter;
