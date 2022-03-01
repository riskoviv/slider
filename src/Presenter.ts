import BaseView from './subviews/BaseView';
import ThumbView from './subviews/ThumbView';
import ProgressView from './subviews/ProgressView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';
import utils from './utils';

type stateOption = Omit<IPluginStateOptions, 'isVertical'>;

type optionalSubViewsData = {
  [stateOptionName in keyof stateOption]:
    | typeof ProgressView
    | typeof ScaleView
    | typeof TipView
    | typeof ThumbView
};

type subViewsData = {
  [subViewName in ViewType]: {
    constructorClass:
      | typeof BaseView
      | typeof ThumbView
      | typeof ProgressView
      | typeof ScaleView
      | typeof TipView,
    parentElement: JQuery<HTMLElement>,
    handlers?: [
      {
        eventName: EventName,
        handler: EventHandler<{
          thumbNumber: 1 | 2,
          index: number,
        }>,
      },
    ],
  };
};

class Presenter {
  private options: IPluginOptions;

  readonly sliderView: IView;

  private subViews: { [viewName: string]: ISubView } = {};

  private scaleValueElements: JQuery<HTMLDivElement>[] = [];

  constructor(
    private readonly $pluginRootElem: JQuery<HTMLElement>,
    private readonly model: IModel,
  ) {
    this.options = this.model.options;

    const {
      value1,
      value2,
      minValue,
      maxValue,
      stepSize,
      isVertical,
      isInterval,
    } = this.options;

    this.sliderView = new View({ isVertical, isInterval });

    this.fillAllowedPositionsArr(maxValue, minValue, stepSize);
    this.createSubViews();
    this.appendSubViewsToSlider();
    this.insertSliderToContainer();
    this.bindEventListeners();
  }

  private createSubView(subViewName: ViewType, number?: 1 | 2) {
    const subViewCreationData: subViewsData = {
      base: {
        constructorClass: BaseView,
        parentElement: this.sliderView.$controlContainer,
      },
      thumb: {
        constructorClass: ThumbView,
        parentElement: this.sliderView.$controlContainer,
        handlers: [
          {
            eventName: 'thumbValueChange',
            handler: this.thumbValueChange,
          },
        ],
      },
      progress: {
        constructorClass: ProgressView,
        parentElement: this.subViews.base.$elem,
      },
      scale: {
        constructorClass: ScaleView,
        parentElement: this.sliderView.$elem,
        handlers: [
          {
            eventName: 'scaleValueSelect',
            handler: this['scaleValueSelect'],
          },
        ],
      },
      tip: {
        constructorClass: TipView,
        parentElement: this.sliderView.$controlContainer,
      },
    };

    const currentElementData = subViewCreationData[subViewName];
    const subViewFullName = `${subViewName}${number ?? ''}`;
    const { constructorClass: SubViewClass } = currentElementData;
    switch (SubViewClass) {
      case ThumbView || TipView:
        this.subViews[subViewFullName] = new SubViewClass(number ?? 1);
        break;
      case BaseView || ProgressView || ScaleView:
        this.subViews[subViewFullName] = new SubViewClass();
        break;
      default:
        break;
    }

    currentElementData.parentElement.append(this.subViews[subViewFullName].render());

    currentElementData.handlers?.forEach(({ eventName, handler }) => {
      this.subViews[subViewFullName].on(eventName, handler);
    })
  }

  private removeSubView(subViewName: string): void {
    this.subViews[subViewName].removeView();
    delete this.subViews[subViewName];
  }

  private renderSubView(subViewName: string): void {
    this.subViews[subViewName].render();
  }

  private insertSliderToContainer(): void {
    this.$pluginRootElem.append(this.sliderView.$elem);
  }

  /**
   * Model listeners
   */

  private changeStepSize = (stepSize: number) => {
    // this.view.changeStepSize(stepSize);
    console.warn('Method is not implemented yet!');
  }

  private changeOrientation = (isVertical: boolean) => {
    console.warn('Method is not implemented yet!');
  }

  private changeInterval(isInterval: boolean) {
    if (isInterval) {
      if (this.subViews.thumb2 === undefined) {
        this.subViews.thumb2 = new ThumbView(2);
        this.sliderView.$controlContainer.append(this.subViews.thumb2.render());
      }
    } else {
      this.subViews.thumb2.removeView();
      delete this.subViews.thumb2;
    }
  }

  /**
   * SubViews listeners
   */

  private thumbValueChange = (
    options: {
      thumbNumber: 1 | 2,
      index: number
    },
  ) => {
    this.model.setValue(options.thumbNumber, options.index);
  }

  private changeTipValue = (options: { tipNumber: 1 | 2, value: number }) => {
    const { tipNumber, value } = options;
    this.subViews[`tip${tipNumber}`].setValue?.(value);
  }

  private scaleValueSelect(options: { index: number }) {
    const { index } = options;
    if (this.options.isInterval) {
      const thumbNumber = this.findClosestThumb(index);
      this.subViews[`thumb${thumbNumber}`].setPositionAndCurrentValue?.(
        this.allowedPositions[index], false,
      );
    } else {
      this.subViews.thumb1.setPositionAndCurrentValue?.(
        this.allowedPositions[index], false,
      );
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

    if (this.model.allowedPositions.slice(-1)[0] !== 100) {
      this.model.allowedPositions.push(100);
    }
  }

  /**
   * HandleView helper functions
   */

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const dimension = this.options.isVertical ? 'offsetHeight' : 'offsetWidth';
    return Number(((pixels / this.sliderView.$controlContainer[dimension]) * 100)
      .toFixed(1));
  }

  private findClosestAllowedPosition(position: number) {
    return this.model.allowedPositions.reduce((lastMinValue: number, currentValue: number) => {
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
    View.$controlContainer.css(`--thumb-${this.thumbNumber}-position`, `${this.currentPosition}%`);
    this.params.positions[this.thumbNumber] = this.currentPosition;
    this.emit('thumbValueChange', {
      thumbNumber: this.thumbNumber,
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
      this.scaleValueElements = this.allowedPositions.map((value, index) => (
        this.makeNewScaleValueElement(index, value)
      ));
    } else {
      for (let index = 0; index <= lastElemIndex; index += quotient) {
        this.scaleValueElements.push(this.makeNewScaleValueElement(index, this.allowedPositions[index]));
      }

      const isLastElemIsNotMaxValue = this.scaleValueElements.slice(-1)[0].data('index') !== lastElemIndex;
      if (isLastElemIsNotMaxValue) {
        this.scaleValueElements.push(
          this.makeNewScaleValueElement(lastElemIndex, 100),
        );
      }
    }
  }

  private makeNewScaleValueElement = (index: number, position: number): JQuery<HTMLDivElement> => (
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
    const $firstElem = this.scaleValueElements[0];
    const $lastElem = this.scaleValueElements.slice(-1)[0];
    let $currentElem = $firstElem;
    let curElemEdgeBound = this.getElementEdgeBound($currentElem);

    this.scaleValueElements.slice(1).forEach(($elem) => {
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

  private thumbChecks = {
    isCursorMovedHalfStep: (thumb: IHandleView, position: number) => (
      Math.abs(position - thumb.currentPosition) > this.params.stepSizeInPercents / 2
    ),
    isCursorOnStepPosition: (position: number) => (
      this.model.allowedPositions.includes(position)
        && position !== this.currentPosition
    ),
    isHandleKeepsDistance: (newPosition: number): boolean => {
      if (this.thumbNumber === 1) {
        return newPosition <= this.params.positions[2] - this.params.stepSizeInPercents;
      }

      return newPosition >= this.params.positions[1] + this.params.stepSizeInPercents;
    },
    isHandleInRange: (position: number) => position >= 0 && position <= 100,
  }

  private findClosestThumb(valueIndex: number): 1 | 2 {
    const thumb1Index = this.model.getValueIndex(1);
    const thumb2Index = this.model.getValueIndex(2);

    if (Math.abs(valueIndex - thumb1Index) < Math.abs(valueIndex - thumb2Index)) {
      return 1;
    }

    if (Math.abs(valueIndex - thumb1Index) > Math.abs(valueIndex - thumb2Index)) {
      return 2;
    }

    return 1;
  }
}

export default Presenter;
