import $ from 'jquery';
import TrackView from './subviews/TrackView';
import ThumbView from './subviews/ThumbView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';

type subViewClass = (
  | typeof TrackView
  | typeof ThumbView
  | typeof ScaleView
  | typeof TipView
);

type subViewsData = {
  [subViewName in ViewType]: {
    constructorClass: subViewClass,
    parentElement: JQuery<HTMLElement>,
  };
};

const isTipClass = (SubViewClass: subViewClass): SubViewClass is typeof TipView => SubViewClass.name === 'TipView';

class Presenter {
  private options: IPluginOptions;

  readonly view: IView;

  private subViews: { [viewName: string]: InstanceType<subViewClass> } = {};

  private sizeDimension: SizeDimension = 'offsetWidth';

  private positionDimension: 'offsetLeft' | 'offsetTop' = 'offsetLeft';

  private positionAxis: PositionAxis = 'left';

  private offset: 'offsetX' | 'offsetY' = 'offsetX';

  private subViewCreationData: subViewsData;

  private sliderResizeObserver: ResizeObserver | undefined;

  private fixValue = this.model.fixValueToPrecision.bind(this.model);

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
      showProgressBar,
    } = this.options;

    this.updateDimensionAndAxis();
    this.defineViewValues();
    this.view = new View({ isVertical, isInterval, showProgressBar });
    this.toggleContainerClass(isVertical);
    this.view.setThumbThickness(this.model.viewValues.stepInPercents);
    this.view.on('sliderPointerDown', this.viewEventHandlers.sliderPointerDown);
    this.subViewCreationData = {
      track: {
        constructorClass: TrackView,
        parentElement: this.view.$controlContainer,
      },
      thumb: {
        constructorClass: ThumbView,
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
    if (this.options.showScale) this.updateScale();
    this.passInitialValuesToSubViews({
      value1,
      value2,
    });
  }

  private bindModelEventListeners(): void {
    const listeners = this.modelEventListeners;
    this.model.on('isVerticalChanged', listeners.changeOrientation)
      .on('isIntervalChanged', listeners.changeInterval)
      .on('valueChanged', listeners.setValueAndPosition)
      .on('showProgressChanged', listeners.changeShowProgress)
      .on('showTipChanged', listeners.changeShowTip)
      .on('showScaleChanged', listeners.changeShowScale)
      .on('stepSizeChanged', listeners.updateBounds)
      .on('minValueChanged', listeners.updateBounds)
      .on('maxValueChanged', listeners.updateBounds);
  }

  private initResizeObserver(): void {
    if (this.sliderResizeObserver === undefined) {
      this.sliderResizeObserver = new ResizeObserver(() => {
        if (this.subViews.scale instanceof ScaleView) {
          this.subViews.scale.optimizeValuesCount(this.positionAxis, this.sizeDimension);
        }
      });
    }

    this.sliderResizeObserver.unobserve(this.view.$elem[0]);
    this.sliderResizeObserver.observe(this.view.$elem[0]);
  }

  private updateDimensionAndAxis() {
    if (this.options.isVertical) {
      this.sizeDimension = 'offsetHeight';
      this.positionDimension = 'offsetTop';
      this.positionAxis = 'top';
      this.offset = 'offsetY';
    } else {
      this.sizeDimension = 'offsetWidth';
      this.positionDimension = 'offsetLeft';
      this.positionAxis = 'left';
      this.offset = 'offsetX';
    }
  }

  private passInitialValuesToSubViews({ value1, value2 }: { value1: number, value2: number }) {
    const position1 = this.getPositionByValue(value1);
    const position2 = this.getPositionByValue(value2);
    this.setPosition(1, position1);
    if (this.options.showTip) {
      this.setTipValue({ number: 1, value: value1 });
    }
    if (this.options.isInterval) {
      this.setPosition(2, position2);
      if (this.options.showTip) {
        this.setTipValue({ number: 2, value: value2 });
      }
    }
  }

  private createInitialSubViews() {
    this.createSubView('track');
    this.createSubView('thumb', 1);

    if (this.options.showTip) {
      this.createSubView('tip', 1);
    }

    if (this.options.isInterval) {
      this.createSubView('thumb', 2);
      if (this.options.showTip) {
        this.createSubView('tip', 2);
        this.createSubView('tip', 3);
      }
    }

    if (this.options.showScale) {
      this.createSubView('scale');
    }
  }

  private createSubView(subViewName: ViewType, number?: 1 | 2 | 3): void {
    const currentElementData = this.subViewCreationData[subViewName];
    let subViewFullName = subViewName;
    const SubViewClass = currentElementData.constructorClass;
    if (subViewName === 'thumb' || subViewName === 'tip') {
      subViewFullName += number ?? 1;
      if (!this.subViewExists(subViewFullName)) {
        if (isTipClass(SubViewClass)) {
          this.subViews[subViewFullName] = new SubViewClass(number ?? 1);
        } else if (number !== 3) {
          this.subViews[subViewFullName] = new SubViewClass(number ?? 1);
        }
      }
    } else if (!this.subViewExists(subViewFullName)) {
      this.subViews[subViewFullName] = new SubViewClass();
    }

    currentElementData.parentElement.append(this.renderSubView(subViewFullName));

    if (subViewName === 'scale') {
      this.subViews[subViewFullName].on('scaleValueSelect', this.viewEventHandlers.scaleValueSelect);
    }
  }

  // **************************************
  // *
  // * scale values creation methods start
  // *
  // **************************************
  private updateScale(): void {
    const { scale } = this.subViews;
    if (scale instanceof ScaleView) {
      this.createScaleValuesElements(scale);
      scale.insertScaleValueElements();
      this.initResizeObserver();
    }
  }

  private createScaleValuesElements(scaleView: ScaleView): void {
    const scale = scaleView;
    const scaleSize = this.$pluginRootElem[0][this.sizeDimension];
    const { allowedValuesCount } = this.model;
    const quotient = Math.round((allowedValuesCount / scaleSize) * 5);
    const lastElemIndex = allowedValuesCount - 1;
    const isEveryValueAllowed = [0, 1].includes(quotient);
    const { stepInPercents } = this.model.viewValues;
    scale.scaleValueElements.length = 0;

    if (isEveryValueAllowed) {
      for (
        let position = 0, index = 0;
        position <= 100;
        index += 1, position = stepInPercents * index
      ) {
        const value = this.model.getValueByIndex(index);
        scale.scaleValueElements.push(this.makeNewScaleValueElement(value, position));
      }
    } else {
      for (let index = 0; index <= lastElemIndex; index += quotient) {
        scale.scaleValueElements.push(this.makeNewScaleValueElement(
          this.model.getValueByIndex(index),
          this.getPositionByIndex(index),
        ));
      }
    }

    const lastElemIsNotMaxValue = scale.scaleValueElements
      .slice(-1)[0][0]
      .style.getPropertyValue('--scale-block-position')
      .trim() !== '100%';
    if (lastElemIsNotMaxValue) {
      scale.scaleValueElements.push(
        this.makeNewScaleValueElement(
          this.options.maxValue,
          100,
        ),
      );
    }
  }

  private makeNewScaleValueElement = (value: number, position: number): JQuery<HTMLDivElement> => (
    $(`<div class="slider__scale-block" style="--scale-block-position: ${position}%">
      <span class="slider__scale-text">${this.fixValue(value)}</span>
    </div>`)
  );
  // ***********************************
  // *
  // * scale values creation methods end
  // *
  // ***********************************

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
    const index = this.model.getIndexByValue(value);
    return this.thumbChecks.fixIfOutOfRange(this.model.viewValues.stepInPercents * index);
  }

  private getIndexByPosition(position: number): number {
    return Math.round(position / this.model.viewValues.stepInPercents);
  }

  private getPositionByIndex(index: number): number {
    return this.model.viewValues.stepInPercents * index;
  }

  private getValueByPosition(position: number): number {
    if (position === 100) return this.options.maxValue;
    const index = this.getIndexByPosition(position);
    return this.model.getValueByIndex(index);
  }

  private modelEventListeners = {
    updateBounds: (): void => {
      this.defineViewValues();
      if (this.options.showScale) {
        this.updateScale();
      }
    },

    changeOrientation: (isVertical: boolean): void => {
      this.updateDimensionAndAxis();
      this.view.toggleVertical(isVertical);
      if (this.options.showScale && this.subViews.scale instanceof ScaleView) {
        this.initResizeObserver();
      }
      this.toggleContainerClass(isVertical);
    },

    changeInterval: (isInterval: boolean): void => {
      if (isInterval) {
        this.createSubView('thumb', 2);
        if (this.options.showTip) {
          this.createSubView('tip', 2);
          this.createSubView('tip', 3);
          this.setTipValue({
            number: 2,
            value: this.options.value2,
          });
          this.setTipValue({
            number: 3,
            value: `${this.options.value1} – ${this.options.value2}`,
          });
        }
      } else {
        this.removeSubView('thumb2');
        this.removeSubView('tip2');
        this.removeSubView('tip3');
      }

      this.view.toggleInterval(isInterval);
    },

    setValueAndPosition: (
      { number, value, changeTipValue }: { number: 1 | 2, value: number, changeTipValue: boolean },
    ): void => {
      if (this.options.showTip && changeTipValue) {
        this.setTipValue({ number, value });
      }

      const position = this.getPositionByValue(value);
      this.setPosition(number, position);
    },

    changeShowProgress: (showProgress: boolean): void => {
      this.view.toggleProgressBar(showProgress);
    },

    changeShowTip: (showTip: boolean): void => {
      if (showTip) {
        this.createSubView('tip', 1);
        this.setTipValue({
          number: 1,
          value: this.options.value1,
        });
        if (this.options.isInterval) {
          this.createSubView('tip', 2);
          this.createSubView('tip', 3);
          this.setTipValue({
            number: 2,
            value: this.options.value2,
          });
          this.setTipValue({
            number: 3,
            value: `${this.options.value1} – ${this.options.value2}`,
          });
        }
      } else {
        this.removeSubView('tip1');
        if (this.options.isInterval) {
          this.removeSubView('tip2');
          this.removeSubView('tip3');
        }
      }
    },

    changeShowScale: (showScale: boolean): void => {
      if (showScale) {
        this.createSubView('scale');
        this.updateScale();
      } else {
        this.removeSubView('scale');
        this.sliderResizeObserver?.disconnect();
      }
    },
  };

  private thumbChecks = {
    isCursorMovedHalfStep: (position: number): boolean => (
      Math.abs(position - this.currentThumbData.currentPosition)
        > this.model.viewValues.halfStepInPercents
    ),

    isThumbKeepsDistance: (newPosition: number): boolean => {
      const { thumbNumber } = this.currentThumbData;
      if (thumbNumber === 1) {
        const thumb2Position = this.model.viewValues.positions[2];
        return newPosition < thumb2Position;
      }

      const thumb1Position = this.model.viewValues.positions[1];
      return newPosition > thumb1Position;
    },

    isSetToMaxPositionAllowed: (newPosition: number) => (
      this.currentThumbData.currentPosition !== 100
      && this.isPointerLessThanHalfStepAwayFromMax(newPosition)
    ),

    isSetToPenultimatePositionAllowed: (newPosition: number) => (
      this.currentThumbData.currentPosition !== this.model.viewValues.penultimatePosition
      && this.isPointerLessThanHalfStepAwayFromPenultimate(newPosition)
    ),

    isOtherThumbOnPenultimatePosition: () => {
      const otherThumbNumber = this.currentThumbData.thumbNumber === 1 ? 2 : 1;
      const otherThumbPosition = this.model.viewValues.positions[otherThumbNumber];
      return otherThumbPosition === this.model.viewValues.penultimatePosition;
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
          this.saveCurrentThumbData(thumbNumber);
        }
      } else if (target === this.view.controlContainerElem) {
        const position = this.pixelsToPercentsOfSliderLength(data[this.offset]);
        const closestThumb = this.options.isInterval
          ? this.findClosestThumbByPosition(position)
          : 1;

        this.saveCurrentThumbData(closestThumb);
        if (this.thumbChecks.isSetToMaxPositionAllowed(position)) {
          if (!(this.options.isInterval && closestThumb === 1)) {
            this.setPositionAndCurrentValue({
              number: closestThumb,
              position: 100,
              value: this.options.maxValue,
            });
          }
        } else if (!this.isPointerLessThanHalfStepAwayFromMax(position)) {
          const allowedPosition = this.findClosestAllowedPosition(position);
          const allowedValue = this.fixValue(this.getValueByPosition(allowedPosition));

          if (allowedPosition !== this.currentThumbData.currentPosition
              && allowedValue !== this.currentThumbData.currentValue) {
            const isFirstThumbAwayFromSecondThumb = this.options.isInterval
              ? this.thumbChecks.isThumbKeepsDistance(allowedPosition)
              : true;
            if (isFirstThumbAwayFromSecondThumb) {
              this.setPositionAndCurrentValue({
                number: closestThumb,
                position: allowedPosition,
                value: allowedValue,
              });
            }
          }
        }
      }

      this.view.controlContainerElem.addEventListener('pointermove', this.viewEventHandlers.sliderPointerMove);
      this.view.controlContainerElem.addEventListener('pointerup', this.viewEventHandlers.sliderPointerUp, {
        once: true,
      });
    },

    sliderPointerMove: (e: PointerEvent): void => {
      let newPosition = this.pixelsToPercentsOfSliderLength(e[this.offset]);
      const { thumbNumber } = this.currentThumbData;
      if (this.thumbChecks.isSetToMaxPositionAllowed(newPosition)) {
        if (!(this.options.isInterval && thumbNumber === 1)) {
          this.setPositionAndCurrentValue({
            number: thumbNumber,
            position: 100,
            value: this.options.maxValue,
          });
        }
      } else if (this.thumbChecks.isSetToPenultimatePositionAllowed(newPosition)) {
        const isThumbAwayFromOtherThumb = this.options.isInterval
          ? !this.thumbChecks.isOtherThumbOnPenultimatePosition()
          : true;
        if (isThumbAwayFromOtherThumb) {
          this.setPositionAndCurrentValue({
            number: thumbNumber,
            position: this.model.viewValues.penultimatePosition,
            value: this.model.penultimateValue,
          });
        }
      } else {
        const movedHalfStep = this.thumbChecks.isCursorMovedHalfStep(newPosition);
        if (movedHalfStep) {
          newPosition = this.findClosestAllowedPosition(
            this.thumbChecks.fixIfOutOfRange(newPosition),
          );
          const isThumbAwayFromOtherThumb = this.options.isInterval
            ? this.thumbChecks.isThumbKeepsDistance(newPosition)
            : true;
          const newValue = this.fixValue(this.getValueByPosition(newPosition));
          if (isThumbAwayFromOtherThumb) {
            this.setPositionAndCurrentValue({
              number: thumbNumber,
              position: newPosition,
              value: newValue,
            });
          }
        }
      }
    },

    sliderPointerUp: (): void => {
      this.view.controlContainerElem.removeEventListener('pointermove', this.viewEventHandlers.sliderPointerMove);
    },

    scaleValueSelect: (value: number): void => {
      const position = this.getPositionByValue(value);
      let thumbNumber: 1 | 2 = 1;
      if (this.options.isInterval) {
        thumbNumber = this.findClosestThumbByValue(value);
      }

      if (this.options[`value${thumbNumber}`] !== value) {
        this.setPositionAndCurrentValue({
          number: thumbNumber,
          position,
          value,
        });
      }
    },
  }

  // debug tools
  private dataMonitor: JQuery<HTMLElement> = $('.data-monitor');

  private setMonitorData(data: { [description: string]: string | number | boolean }): void {
    this.dataMonitor.html('');
    Object.entries(data).forEach(([description, value]) => {
      const htmlStr = value === ''
        ? `<p>${description}</p>`
        : `<p>${description}: <span>${value}</span></p>`;
      this.dataMonitor.append(htmlStr);
    });
  }

  private toggleContainerClass(isVertical: boolean): void {
    this.$pluginRootElem.toggleClass('slider-container_vertical', isVertical);
  }

  // end of debug tools

  private currentThumbData: {
    thumbNumber: 1 | 2,
    currentPosition: number,
    currentValue: number,
  } = { thumbNumber: 1, currentPosition: NaN, currentValue: NaN };

  private saveCurrentThumbData(thumbNumber: 1 | 2) {
    this.currentThumbData = {
      thumbNumber,
      currentPosition: this.model.viewValues.positions[thumbNumber],
      currentValue: this.options[`value${thumbNumber}`],
    };
  }

  private getPenultimatePosition() {
    return this.model.viewValues.stepInPercents * (this.model.allowedValuesCount - 2);
  }

  private isPointerLessThanHalfStepAwayFromMax(newPosition: number) {
    return newPosition > this.model.viewValues.penultimatePosition
      + this.model.viewValues.halfStepFromPenultimateToMax;
  }

  private isPointerLessThanHalfStepAwayFromPenultimate(newPosition: number) {
    return newPosition < 100 - this.model.viewValues.halfStepFromPenultimateToMax
      && newPosition > this.model.viewValues.penultimatePosition;
  }

  private pixelsToPercentsOfSliderLength(pixels: number): number {
    return Number(((pixels / sliderLength) * 100).toFixed(1));
    const sliderLength = this.view.$controlContainer[0][this.sizeDimension];
  }

  private findClosestAllowedPosition(position: number): number {
    if (position === 100) return 100;
    const step = this.model.viewValues.stepInPercents;
    return this.thumbChecks.fixIfOutOfRange(Math.round(position / step) * step);
  }

  private findClosestThumbByValue(value: number): 1 | 2 {
    const { value1, value2 } = this.options;
    if (Math.abs(value - value1) > Math.abs(value - value2)) {
      return 2;
    }

    return 1;
  }

  private findClosestThumbByPosition(position: number): 1 | 2 {
    const { 1: position1, 2: position2 } = this.model.viewValues.positions;
    const position1Diff = Math.abs(position1 - position);
    const position2Diff = Math.abs(position2 - position);
    return position1Diff <= position2Diff ? 1 : 2;
  }

  private areTipsOverlap() {
    const [tip1Elem] = this.subViews.tip1.$elem;
    const [tip2Elem] = this.subViews.tip2.$elem;
    const tip1Bound = tip1Elem[this.positionDimension] + tip1Elem[this.sizeDimension];
    const tip2Bound = tip2Elem[this.positionDimension];

    if (tip1Bound >= tip2Bound) return true;
    return false;
  }

  private setPositionAndCurrentValue(options: {
    number: 1 | 2,
    position: number,
    value: number,
  }): void {
    const {
      number,
      position,
      value,
    } = options;

    this.currentThumbData.thumbNumber = number;
    this.setPosition(number, position);
    this.saveCurrentValue(number, value);
    if (this.options.showTip) {
      this.setTipValue({ number, value });
    }
  }

  private setPosition(number: 1 | 2, position: number): void {
    this.currentThumbData.currentPosition = position;
    this.view.setPosition(number, position);
    this.model.viewValues.positions[number] = position;
  }

  private saveCurrentValue(number: 1 | 2, value: number): void {
    this.currentThumbData.currentValue = value;
    this.options[`value${number}`] = value;
  }

  private setTipValue(options: { number: 1 | 2 | 3, value: number | string }): void {
    const { number: tipNumber, value } = options;
    const tipName: 'tip1' | 'tip2' | 'tip3' = `tip${tipNumber}`;
    const tip = this.subViews[tipName];
    if (tip instanceof TipView) {
      tip.setValue(value);
    }

    if (this.options.isInterval && this.subViewExists('tip2')) {
      if (this.areTipsOverlap()) {
        this.showJointTip();
      } else {
        this.showSeparateTips();
      }
    }
  }

  private showJointTip() {
    const tipHiddenClass = 'slider__tip_hidden';
    const { tip1, tip2, tip3 } = this.subViews;
    if (tip3 instanceof TipView) {
      tip3.setValue(`${this.options.value1} – ${this.options.value2}`);
    }

    tip3.$elem.removeClass(tipHiddenClass);
    tip1.$elem.addClass(tipHiddenClass);
    tip2.$elem.addClass(tipHiddenClass);
  }

  private showSeparateTips() {
    const tipHiddenClass = 'slider__tip_hidden';
    const { tip1, tip2, tip3 } = this.subViews;
    tip3.$elem.addClass(tipHiddenClass);
    tip1.$elem.removeClass(tipHiddenClass);
    tip2.$elem.removeClass(tipHiddenClass);
  }

  private defineViewValues(): void {
    const { minValue, maxValue, stepSize } = this.options;
    const totalSliderRange = maxValue - minValue;
    this.model.viewValues.stepInPercents = (stepSize / totalSliderRange) * 100;
    this.model.viewValues.halfStepInPercents = this.model.viewValues.stepInPercents / 2;
    this.model.allowedValuesCount = this.model.getAllowedValuesCount();
    this.model.penultimateValue = this.model.getPenultimateValue();
    this.model.viewValues.penultimatePosition = this.getPenultimatePosition();
    this.model.viewValues.halfStepFromPenultimateToMax = (
      100 - this.model.viewValues.penultimatePosition
    ) / 2;
  }
}

export default Presenter;
