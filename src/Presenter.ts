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

class Presenter {
  private options: IPluginOptions;

  readonly view: IView;

  private subViews: { [viewName: string]: InstanceType<subViewClass> } = {};

  private dimension: Dimension = 'width';

  private axis: Axis = 'left';

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
    this.model.on('stepSizeChanged', listeners.changeStepSize)
      .on('isVerticalChanged', listeners.changeOrientation)
      .on('isIntervalChanged', listeners.changeInterval)
      .on('valueChanged', listeners.setValueAndPosition);
  }

  private initResizeObserver(): void {
    this.sliderResizeObserver = new ResizeObserver(() => {
      if (this.subViews.scale instanceof ScaleView) {
        this.subViews.scale.optimizeValuesCount(this.axis, this.dimension);
      }
    });
    this.sliderResizeObserver.observe(this.view.$elem.get()[0]);
  }

  private updateDimensionAndAxis() {
    if (this.options.isVertical) {
      this.dimension = 'height';
      this.axis = 'top';
      this.offset = 'offsetY';
    } else {
      this.dimension = 'width';
      this.axis = 'left';
      this.offset = 'offsetX';
    }
  }

  private passInitialValuesToSubViews(values: { value1: number, value2: number }): void {
    const { value1, value2 } = values;
    const position1 = this.getPositionByValue(value1);
    const position2 = this.getPositionByValue(value2);
    this.setPositionAndCurrentValue({
      number: 1,
      position: position1,
      value: value1,
    });
    if (this.options.isInterval) {
      this.setPositionAndCurrentValue({
        number: 2,
        position: position2,
        value: value2,
      });
    }
  }

  private createInitialSubViews() {
    this.createSubView('track');

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
    const scaleSize = scale.$elem[this.dimension]() ?? 1;
    const { allowedValuesCount } = this.model;
    const quotient = Math.round((allowedValuesCount / scaleSize) * 3);
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
      .slice(-1)[0]
      .get()[0]
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
    return this.model.viewValues.stepInPercents * index;
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

  private isPositionAllowed(position: number): boolean {
    return Number.isInteger(position / this.model.viewValues.stepInPercents);
  }

  private modelEventListeners = {
    changeStepSize: (): void => {
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

    isThumbKeepsDistance: (newPosition: number): boolean => {
      const { thumbNumber } = this.currentThumbData;
      if (thumbNumber === 1) {
        const thumb1NewIndex = this.getIndexByPosition(newPosition);
        const thumb2Index = this.model.getIndexByValueNumber(2);
        return thumb1NewIndex < thumb2Index;
      }

      const thumb2NewIndex = this.getIndexByPosition(newPosition);
      const thumb1Index = this.model.getIndexByValueNumber(1);
      return thumb2NewIndex > thumb1Index;
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
        const position = this.pixelsToPercentsOfSliderLength(
          data[this.offset],
        );
        const allowedPosition = this.findClosestAllowedPosition(position);
        const allowedValue = this.fixValue(this.getValueByPosition(allowedPosition));
        const chosenThumb = this.options.isInterval
          ? this.findClosestThumbByPosition(position)
          : 1;

        this.currentThumbData = {
          thumbNumber: chosenThumb,
          currentPosition: allowedPosition,
        };
        this.setPositionAndCurrentValue({
          number: chosenThumb,
          position: allowedPosition,
          value: allowedValue,
        });
      }

      this.view.controlContainerElem.addEventListener('pointermove', this.sliderPointerMove);
      this.view.controlContainerElem.addEventListener('pointerup', this.sliderPointerUp, {
        once: true,
      });
    },

    scaleValueSelect: (value: number): void => {
      const position = this.getPositionByValue(value);
      let thumbNumber: 1 | 2 = 1;
      if (this.options.isInterval) {
        thumbNumber = this.findClosestThumbByValue(value);
      }

      this.currentThumbData = {
        thumbNumber,
        currentPosition: position,
      };

      this.setPositionAndCurrentValue({
        number: thumbNumber,
        position,
        value,
      });
    },
  }

  // debug tools
  private dataMonitor: JQuery<HTMLElement> = $('.data-monitor');

  private setMonitorData(elementsData: { [elementName: string]: string | number | boolean }): void {
    this.dataMonitor.html('');
    Object.entries(elementsData).forEach(([elementName, elementText]) => {
      this.dataMonitor.append(`<p>${elementName}: <span>${elementText}</span></p>`);
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

  private currentValueIsPenultimateValue() {
    return this.currentThumbData.currentValue === this.model.penultimateValue;
  }

  private getPenultimatePosition() {
    return this.model.viewValues.stepInPercents * (this.model.allowedValuesCount - 2);
  }

  private sliderPointerMove = (e: PointerEvent): void => {
    let newPosition = this.pixelsToPercentsOfSliderLength(e[this.offset]);
    const { currentPosition, thumbNumber } = this.currentThumbData;
    const penultimatePosition = this.getPenultimatePosition();
    const halfStepFromPenultimateToMax = (100 - penultimatePosition) / 2;
    if (this.currentValueIsPenultimateValue()
      && newPosition > currentPosition + halfStepFromPenultimateToMax) {
      console.log('penultimate & half step+ to right');
      if (!(this.options.isInterval && thumbNumber === 1)) {
        this.setPositionAndCurrentValue({
          number: thumbNumber,
          position: 100,
          value: this.options.maxValue,
        });
      }
    } else if (currentPosition === 100
      && newPosition < currentPosition - halfStepFromPenultimateToMax) {
      console.log('maxValue & half step+ to left');
      this.setPositionAndCurrentValue({
        number: thumbNumber,
        position: penultimatePosition,
        value: this.fixValue(this.model.getPenultimateValue()),
      });
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
  }

  private sliderPointerUp = (e: PointerEvent): void => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.view.controlContainerElem.removeEventListener('pointermove', this.sliderPointerMove);
  }

  private pixelsToPercentsOfSliderLength(pixels: number): number {
    const offset = this.options.isVertical ? 'offsetHeight' : 'offsetWidth';
    const sliderLength = this.view.$controlContainer.get()[0][offset];
    return Number(((pixels / sliderLength) * 100).toFixed(1));
  }

  private findClosestAllowedPosition(position: number): number {
    if (position === 100) return 100;
    const step = this.model.viewValues.stepInPercents;
    return this.thumbChecks.fixIfOutOfRange(Math.round(position / step) * step);
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

    this.setPosition(number, position);
    this.saveValueInModel(number, value);
    this.setTipValue({ number, value });
  }

  private setPosition(number: 1 | 2, position: number): void {
    this.currentThumbData.currentPosition = position;
    this.view.setPosition(number, position);
    this.model.viewValues.positions[number] = position;
  }

  private saveValueInModel(number: 1 | 2, value: number): void {
    this.model.options[`value${number}`] = value;
  }

  private setTipValue(options: { number: 1 | 2, value: number }): void {
    const { number: tipNumber, value } = options;
    const tipName = tipNumber === 1 ? 'tip1' : 'tip2';
    const tip = this.subViews[tipName];
    if (tip instanceof TipView) {
      tip.setValue(value);
    }
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

  private defineViewValues(): void {
    const { minValue, maxValue, stepSize } = this.options;
    const totalSliderRange = maxValue - minValue;
    this.model.viewValues.stepInPercents = (stepSize / totalSliderRange) * 100;
    this.model.viewValues.halfStepInPercents = this.model.viewValues.stepInPercents / 2;
    this.model.viewValues.penultimatePosition = this.getPenultimatePosition();
    this.model.viewValues.halfStepFromPenultimateToMax = (
      100 - this.model.viewValues.penultimatePosition
    ) / 2;
  }
}

export default Presenter;
