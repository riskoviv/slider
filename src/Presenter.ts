import BaseView from './subviews/BaseView';
import HandleView from './subviews/HandleView';
import ProgressView from './subviews/ProgressView';
import ScaleView from './subviews/ScaleView';
import SliderView from './subviews/SliderView';
import TipView from './subviews/TipView';

class Presenter {
  views: { [viewName: string]: IView } = {};

  constructor(
    private readonly pluginRootElem: JQuery<HTMLElement>,
    private readonly model: IModel,
  ) {
    const {
      value1, value2, minValue, maxValue, stepSize,
    } = model.options;

    this.fillAllowedPositionsArr(maxValue, minValue, stepSize);

    this.bindEventListeners();
  }

  private createSubViews(): void {
    const optionsToSubviewsRelations = {
      showProgressBar: {
        viewClass: ProgressView,
      },
      showScale: {
        viewClass: ScaleView,
      },
      showTip: {
        viewClass: TipView,
      },
    };

    Object.keys(optionsToSubviewsRelations).forEach((optionalSubView, i, relations) => {
      if (this.model.options[optionalSubView]) {

      }
    });
  }

  private bindEventListeners() {
    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('isVerticalChanged', this.changeOrientation);

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

  /**
   * Functions from View, now they're for View
   */

  private fillAllowedPositionsArr = (
    maxValue: number,
    minValue: number,
    stepSize: number,
  ) => {
    const totalSliderRange = maxValue - minValue;
    const positionAccuracy = (totalSliderRange / stepSize).toFixed(0).length - 2;

    this.model.viewValues.stepSizeInPercents = (stepSize / totalSliderRange) * 100;
    this.model.allowedPositions.length = 0;

    for (let i = 0; i <= 100; i += this.model.viewValues.stepSizeInPercents) {
      this.model.allowedPositions.push(
        Number(i.toFixed(positionAccuracy < 1 ? 1 : positionAccuracy)),
      );
    }

    if (this.model.allowedPositions[this.model.allowedPositions.length - 1] !== 100) {
      this.model.allowedPositions.push(100);
    }
  }

  /**
   * HandleView helper functions
   */

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const dimension = this.isVertical ? 'offsetHeight' : 'offsetWidth';
    return Number(((pixels / this.handleDirectContainer[dimension]) * 100)
      .toFixed(1));
  }


  private findClosestAllowedPosition(position: number) {
    return this.params.allowedPositions.reduce((lastMinValue, currentValue) => {
      if (Math.abs(position - currentValue) < Math.abs(position - lastMinValue)) {
        return currentValue;
      }
      return lastMinValue;
    });
  }

  private setPositionAndCurrentValue(allowedPosition: number, findClosest: boolean): void {
    this.currentPosition = findClosest
      ? this.findClosestAllowedPosition(allowedPosition)
      : allowedPosition;
    View.$controlContainer.css(`--handle-${this.handleNumber}-position`, `${this.currentPosition}%`);
    this.params.positions[this.handleNumber] = this.currentPosition;
    this.emit('handleValueChange', {
      handleNumber: this.handleNumber,
      index: this.params.allowedPositions.indexOf(this.currentPosition),
    });
  }

  /**
   * ScaleView helper functions
   */

  private createValuesElements = () => {
    const scaleSize = this.$elem[this.dimension]() || 1;
    const quotient = Math.round((this.allowedPositions.length / scaleSize) * 3);
    const lastElemIndex = this.allowedPositions.length - 1;
    const isEveryValueAllowed = [0, 1].includes(quotient);

    if (isEveryValueAllowed) {
      this.valueElements = this.allowedPositions.map((value, index) => (
        this.makeNewScaleValueElement(index, value)
      ));
    } else {
      for (let index = 0; index <= lastElemIndex; index += quotient) {
        this.valueElements.push(this.makeNewScaleValueElement(index, this.allowedPositions[index]));
      }

      const isLastElemIsNotMaxValue = this.valueElements[this.valueElements.length - 1].data('index') !== lastElemIndex;
      if (isLastElemIsNotMaxValue) {
        this.valueElements.push(
          this.makeNewScaleValueElement(lastElemIndex, 100),
        );
      }
    }
  }

  private makeNewScaleValueElement = (index: number, position: number): JQuery<HTMLSpanElement> => (
    $(`
      <div class="slider__scale-block" data-index="${index}" style="${this.axis}: ${position}%">
        <span class="slider__scale-text">${this.allowedRealValues[index]}</span>
      </div>
    `)
  );

  private getElementEdgeBound(element: JQuery<HTMLSpanElement>): number {
    return element.position()[this.axis] + (element[this.dimension]() ?? 1);
  }

  private optimizeValuesCount() {
    const $firstElem = this.valueElements[0];
    const $lastElem = this.valueElements[this.valueElements.length - 1];
    let $currentElem = $firstElem;
    let curElemEdgeBound = this.getElementEdgeBound($currentElem);

    this.valueElements.slice(1).forEach(($elem) => {
      if ($elem) {
        if ($elem.position()[this.axis] - 5 <= curElemEdgeBound) {
          if ($elem === $lastElem && $currentElem !== $firstElem) {
            $currentElem.addClass('slider__scale-block_unnumbered');
          } else if ($elem !== $lastElem) {
            $elem.addClass('slider__scale-block_unnumbered');
          }
        } else {
          $currentElem = $elem;
          curElemEdgeBound = this.getElementEdgeBound($currentElem);
          $elem.removeClass('slider__scale-block_unnumbered');
        }
      }
    });
  }

  /**
   * Model listeners
   */

  private changeStepSize = (options: { stepSize: number }) => {
    // this.view.changeStepSize(stepSize);
    console.warn('Method is not implemented yet!');
  }

  private changeOrientation = (options: { isVertical: boolean }) => {
    console.warn('Method is not implemented yet!');
  }

  private handleChecks = {
    isCursorMovedHalfStep: (handle: IHandleView, position: number) => (
      Math.abs(position - handle.currentPosition) > this.params.stepSizeInPercents / 2
    ),
    isCursorOnStepPosition: (position: number) => (
      this.model.allowedPositions.includes(position)
        && position !== this.currentPosition
    ),
    isHandleKeepsDistance: (newPosition: number): boolean => {
      if (this.handleNumber === 1) {
        return newPosition <= this.params.positions[2] - this.params.stepSizeInPercents;
      }

      return newPosition >= this.params.positions[1] + this.params.stepSizeInPercents;
    },
    isHandleInRange: (position: number) => position >= 0 && position <= 100,
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
