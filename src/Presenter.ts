import BaseView from './subviews/BaseView';
import ThumbView from './subviews/ThumbView';
import ProgressView from './subviews/ProgressView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';

type subViewClass = (
  | typeof BaseView
  | typeof ThumbView
  | typeof ProgressView
  | typeof ScaleView
  | typeof TipView
);

type subViewsData = {
  [subViewName in ViewType]: {
    constructorClass: subViewClass,
    parentElement: JQuery<HTMLElement>,
  };
};

class Presenter {
  private options: IPluginOptions;

  readonly view: IView;

  private subViews: { [viewName: string]: InstanceType<subViewClass> } = {};

  private dimension: Dimension = 'width';

  private axis: Axis = 'left';

  private offset: 'offsetX' | 'offsetY' = 'offsetX';

  private subViewCreationData: subViewsData;

  constructor(
    private readonly $pluginRootElem: JQuery<HTMLElement>,
    private readonly model: IModel,
  ) {
    this.options = this.model.options;

    const {
      value1,
      value2,
      isVertical,
      isInterval,
    } = this.options;

    this.updateDimensionAndAxis();
    this.view = new View({ isVertical, isInterval });
    this.view.on('sliderPointerDown', this.viewEventHandlers.sliderPointerDown);
    this.updateAllowedPositionsArr();
    this.subViewCreationData = {
      base: {
        constructorClass: BaseView,
        parentElement: this.view.$controlContainer,
      },
      thumb: {
        constructorClass: ThumbView,
        parentElement: this.view.$controlContainer,
      },
      progress: {
        constructorClass: ProgressView,
        // temporarily set this parentElement because BaseView isn't created at this moment yet
        // and base cannot be created before initialization on this object
        parentElement: this.view.$controlContainer,
      },
      scale: {
        constructorClass: ScaleView,
        parentElement: this.view.$elem,
      },
      tip: {
        constructorClass: TipView,
        parentElement: this.view.$controlContainer,
      },
    };
    this.createInitialSubViews();
    this.insertSliderToContainer();
    this.bindModelEventListeners();
    if (this.options.showScale) this.updateScaleView();
    this.passInitialValuesToSubViews({
      value1,
      value2,
    });
    this.setMonitorData({
      position1: this.model.viewValues.positions[1],
      position2: this.model.viewValues.positions[2],
    });
  }

  private bindModelEventListeners(): void {
    const listeners = this.modelEventListeners;
    this.model.on('stepSizeChanged', listeners.changeStepSize)
      .on('isVerticalChanged', listeners.changeOrientation)
      .on('isIntervalChanged', listeners.changeInterval)
      .on('valueChanged', listeners.setValueAndPosition);
  }

  private updateDimensionAndAxis() {
    this.dimension = this.options.isVertical ? 'height' : 'width';
    this.axis = this.options.isVertical ? 'top' : 'left';
    this.offset = this.options.isVertical ? 'offsetY' : 'offsetX';
  }

  private updateScaleView() {
    this.updateDimensionAndAxis();
    const scaleView = this.subViews.scale;
    if (scaleView instanceof ScaleView) {
      scaleView.updateScale({
        allowedPositions: this.model.allowedPositions,
        allowedRealValues: this.model.allowedRealValues,
        dimension: this.dimension,
        axis: this.axis,
      });
    }
  }

  private passInitialValuesToSubViews(values: { value1: number, value2: number }): void {
    const { value1, value2 } = values;
    const value1Index = this.model.allowedRealValues.indexOf(value1);
    const position1 = this.model.allowedPositions[value1Index];
    const value2Index = this.model.allowedRealValues.indexOf(value2);
    const position2 = this.model.allowedPositions[value2Index];
    this.setPositionAndCurrentValue({
      number: 1,
      potentialPosition: position1,
      findClosest: false,
    });
    if (this.options.isInterval) {
      this.setPositionAndCurrentValue({
        number: 2,
        potentialPosition: position2,
        findClosest: false,
      });
    }
  }

  private createInitialSubViews() {
    this.createSubView('base');
    this.subViewCreationData.progress.parentElement = this.subViews.base.$elem;

    const subViewsCreationData: [ViewType, (1 | 2)?][] = [
      ['thumb', 1],
    ];

    if (this.options.showTip) {
      subViewsCreationData.push(['tip', 1]);
    }

    if (this.options.isInterval) {
      subViewsCreationData.push(['thumb', 2]);
      if (this.options.showTip) {
        subViewsCreationData.push(['tip', 2]);
      }
    }

    if (this.options.showScale) {
      subViewsCreationData.push(['scale']);
    }

    if (this.options.showProgressBar) {
      subViewsCreationData.push(['progress']);
    }

    subViewsCreationData.forEach(([subViewName, number]) => {
      if (number === undefined) {
        this.createSubView(subViewName);
      } else {
        this.createSubView(subViewName, number);
      }
    });
  }

  private createSubView(subViewName: ViewType, number?: 1 | 2): void {
    const currentElementData = this.subViewCreationData[subViewName];
    let subViewFullName = subViewName;
    const SubViewClass = currentElementData.constructorClass;
    if (subViewName === 'thumb' || subViewName === 'tip') {
      subViewFullName += number ?? 1;
      if (!this.subViewExists(subViewFullName)) {
        this.subViews[subViewFullName] = new SubViewClass(number ?? 1);
      }
    } else if (!this.subViewExists(subViewFullName)) {
      this.subViews[subViewFullName] = new SubViewClass();
    }

    currentElementData.parentElement.append(this.renderSubView(subViewFullName));

    if (subViewName === 'scale') {
      this.subViews[subViewFullName].on('scaleValueSelect', this.viewEventHandlers.scaleValueSelect);
    }
  }

  private subViewExists(subViewName: string): boolean {
    return this.subViews[subViewName] !== undefined;
  }

  private removeSubView(subViewName: string): void {
    if (this.subViewExists(subViewName)) {
      this.subViews[subViewName].removeView();
      delete this.subViews[subViewName];
    }
  }

  private renderSubView(subViewName: string): JQuery<HTMLElement> {
    return this.subViews[subViewName].$elem;
  }

  private insertSliderToContainer(): void {
    this.$pluginRootElem.append(this.view.$elem);
  }

  private getPositionByValue(value: number): number {
    return this.model.allowedPositions[this.model.allowedRealValues.indexOf(value)];
  }

  private getValueByPosition(position: number): number {
    return this.model.allowedRealValues[this.model.allowedPositions.indexOf(position)];
  }

  private modelEventListeners = {
    changeStepSize: (): void => {
      this.updateAllowedPositionsArr();
      if (this.options.showScale) {
        this.updateScaleView();
      }
    },

    changeOrientation: (isVertical: boolean): void => {
      this.updateDimensionAndAxis();
      if (this.options.showScale) {
        this.updateScaleView();
      }
      this.view.toggleVertical(isVertical);
    },

    changeInterval: (isInterval: boolean): void => {
      if (isInterval) {
        this.createSubView('thumb', 2);
        if (this.options.showTip) {
          this.createSubView('tip', 2);
          this.setTipValue({
            number: 2,
            value: this.model.options.value2,
          });
        }
      } else {
        this.removeSubView('thumb2');
        this.removeSubView('tip2');
      }

      this.view.toggleInterval(isInterval);
    },

    setValueAndPosition: (options: { number: 1 | 2, value: number }): void => {
      if (this.options.showTip) {
        this.setTipValue(options);
      }

      const { number, value } = options;
      const position = this.getPositionByValue(value);
      this.setPosition(number, position);
    },
  };

  private thumbChecks = {
    isCursorMovedHalfStep: (position: number): boolean => (
      Math.abs(position - this.currentThumbData.currentPosition)
        > this.model.viewValues.halfStepInPercents
    ),

    isCursorOnStepPosition: (position: number): boolean => (
      this.model.allowedPositions.includes(position)
        && position !== this.currentThumbData.currentPosition
    ),

    isThumbKeepsDistance: (newPosition: number): boolean => {
      const { thumbNumber } = this.currentThumbData;
      if (thumbNumber === 1) {
        return (
          newPosition <= (
            this.model.viewValues.positions[2] - this.model.viewValues.stepInPercents
          )
        );
      }

      return (
        newPosition >= (
          this.model.viewValues.positions[1] + this.model.viewValues.stepInPercents
        )
      );
    },

    fixIfOutOfRange: (position: number): number => {
      if (position < 0) return 0;
      if (position > 100) return 100;
      return position;
    },
  }

  private viewEventHandlers = {
    sliderPointerDown: (data: {
      target: HTMLDivElement,
      offsetX: number,
      offsetY: number,
    }): void => {
      const { target } = data;
      if (target.classList.contains('slider__thumb')) {
        const thumbNumber = Number(target.dataset.number);
        if (thumbNumber === 1 || thumbNumber === 2) {
          this.currentThumbData = {
            thumbNumber,
            currentPosition: this.model.viewValues.positions[thumbNumber],
          };
        }
      } else if (target === this.view.controlContainerElem) {
        const position = this.pixelsToPercentsOfBaseLength(
          data[this.offset],
        );
        const allowedPosition = this.findClosestAllowedPosition(position);
        if (allowedPosition !== undefined) {
          const allowedIndex = this.model.allowedPositions.indexOf(allowedPosition);
          const chosenThumb = this.findClosestThumb(allowedIndex);
          this.currentThumbData = {
            thumbNumber: chosenThumb,
            currentPosition: allowedPosition,
          };
          this.setPositionAndCurrentValue({
            number: chosenThumb,
            potentialPosition: this.model.allowedPositions[allowedIndex],
            findClosest: false,
          });
        }
      }

      this.setMonitorData({
        action: 'down',
        thumbNumber: this.currentThumbData.thumbNumber,
        currentPosition: this.currentThumbData.currentPosition,
      });

      this.view.controlContainerElem.addEventListener('pointermove', this.sliderPointerMove);
      this.view.controlContainerElem.addEventListener('pointerup', this.sliderPointerUp, {
        once: true,
      });
    },

    scaleValueSelect: (options: { index: number }): void => {
      const { index } = options;
      const position = this.model.allowedPositions[index];
      let thumbNumber: 1 | 2 = 1;
      if (this.options.isInterval) {
        thumbNumber = this.findClosestThumb(index);
      }

      this.currentThumbData = {
        thumbNumber,
        currentPosition: position,
      };

      this.setPositionAndCurrentValue({
        number: thumbNumber,
        potentialPosition: position,
        findClosest: false,
      });
    },
  }

  // debug tool
  private dataMonitor: JQuery<HTMLElement> = $('.data-monitor');

  private setMonitorData(elementsData: { [elementName: string]: string | number | boolean }): void {
    this.dataMonitor.html('');
    Object.entries(elementsData).forEach(([elementName, elementText]) => {
      this.dataMonitor.append(`<p>${elementName}: <span>${elementText}</span></p>`);
    });
  }

  private currentThumbData: {
    thumbNumber: 1 | 2,
    currentPosition: number,
  } = { thumbNumber: 1, currentPosition: 0 };

  private sliderPointerMove = (e: PointerEvent): void => {
    let newPosition = this.pixelsToPercentsOfBaseLength(e[this.offset]);
    const movedHalfStep = this.thumbChecks.isCursorMovedHalfStep(newPosition);
    const onStepPosition = this.thumbChecks.isCursorOnStepPosition(newPosition);

    this.setMonitorData({
      action: 'move',
      newPosition,
      movedHalfStep,
      onStepPosition,
      currentPosition: this.currentThumbData.currentPosition,
    });

    if (movedHalfStep || onStepPosition) {
      newPosition = this.thumbChecks.fixIfOutOfRange(newPosition);
      const isHandleAwayFromOtherHandle = this.options.isInterval
        ? this.thumbChecks.isThumbKeepsDistance(newPosition)
        : true;

      if (isHandleAwayFromOtherHandle) {
        this.setPositionAndCurrentValue({
          number: this.currentThumbData.thumbNumber,
          potentialPosition: newPosition,
          findClosest: movedHalfStep,
        });
      }
    }
  }

  private sliderPointerUp = (e: PointerEvent): void => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.view.controlContainerElem.removeEventListener('pointermove', this.sliderPointerMove);
  }

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const offset = this.options.isVertical ? 'offsetHeight' : 'offsetWidth';
    const baseLength = this.view.$controlContainer.get()[0][offset];
    return Number(((pixels / baseLength) * 100).toFixed(1));
  }

  private findClosestAllowedPosition(position: number): number {
    const posToRight = this.model.allowedPositions.find((pos) => pos > position);
    if (posToRight !== undefined) {
      const posToRightIndex = this.model.allowedPositions.indexOf(posToRight);
      return (posToRight - position < this.model.viewValues.halfStepInPercents)
        ? posToRight
        : this.model.allowedPositions[posToRightIndex - 1];
    }

    return position; // impossible to happen really
  }

  private setPositionAndCurrentValue(options: {
    number: 1 | 2,
    potentialPosition: number,
    findClosest: boolean
  }): void {
    const { number, potentialPosition, findClosest } = options;
    const approvedPosition = findClosest
      ? this.findClosestAllowedPosition(potentialPosition)
      : potentialPosition;
    this.setPosition(number, approvedPosition);
    this.saveValueInModel(number, approvedPosition);
    this.setTipValue({
      number,
      value: this.getValueByPosition(approvedPosition),
    });
  }

  private setPosition(number: 1 | 2, position: number): void {
    this.currentThumbData.currentPosition = position;
    this.view.setPosition(number, position);
    this.model.viewValues.positions[number] = position;
  }

  private saveValueInModel(number: 1 | 2, position: number): void {
    this.model.options[`value${number}`] = this.getValueByPosition(position);
  }

  private setTipValue(options: { number: 1 | 2, value: number }): void {
    const { number: tipNumber, value } = options;
    const tipName = tipNumber === 1 ? 'tip1' : 'tip2';
    const tip = this.subViews[tipName];
    if (tip instanceof TipView) {
      tip.setValue(value);
    }
  }

  private findClosestThumb(valueIndex: number): 1 | 2 {
    const thumb1Index = this.model.getValueIndex(1);
    const thumb2Index = this.model.getValueIndex(2);

    if (Math.abs(valueIndex - thumb1Index) > Math.abs(valueIndex - thumb2Index)) {
      return 2;
    }
    return 1;
  }

  private updateAllowedPositionsArr(): void {
    const { minValue, maxValue, stepSize } = this.options;
    this.fillAllowedPositionsArr({
      minValue,
      maxValue,
      stepSize,
    });
  }

  private fillAllowedPositionsArr = (constraints: {
    minValue: number,
    maxValue: number,
    stepSize: number,
  }) => {
    const { maxValue, minValue, stepSize } = constraints;
    const totalSliderRange = maxValue - minValue;
    const positionAccuracy = (totalSliderRange / stepSize).toFixed(0).length - 2;

    const roundToAccuracy = function roundNumberToPositionAccuracy(num: number): number {
      return Number(num.toFixed(positionAccuracy < 1 ? 1 : positionAccuracy));
    };

    this.model.viewValues.stepInPercents = roundToAccuracy((stepSize / totalSliderRange) * 100);
    this.model.viewValues.halfStepInPercents = this.model.viewValues.stepInPercents / 2;
    this.model.allowedPositions.length = 0;

    for (let i = 0; i <= 100; i += this.model.viewValues.stepInPercents) {
      this.model.allowedPositions.push(roundToAccuracy(i));
    }

    if (this.model.allowedPositions.slice(-1)[0] !== 100) {
      this.model.allowedPositions.push(100);
    }
  }
}

export default Presenter;
