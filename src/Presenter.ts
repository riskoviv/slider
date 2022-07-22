/* eslint-disable no-dupe-class-members */
/* eslint-disable lines-between-class-members */
import $ from 'jquery';
import TrackView from './subviews/TrackView';
import ThumbView from './subviews/ThumbView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';

type SubViews = {
  track: TrackView,
  thumb1: ThumbView,
  thumb2?: ThumbView,
  tip1?: TipView,
  tip2?: TipView,
  tip3?: TipView,
  scale?: ScaleView,
};

class Presenter {
  private options: SliderOptions;

  readonly view: IView;

  private subViews: SubViews = {
    track: new TrackView(),
    thumb1: new ThumbView(),
  };

  private sizeDimension: SizeDimension = 'offsetWidth';

  private positionDimension: 'offsetLeft' | 'offsetTop' = 'offsetLeft';

  private positionAxis: PositionAxis = 'left';

  private offset: 'offsetX' | 'offsetY' = 'offsetX';

  private sliderResizeObserver: ResizeObserver | undefined;

  private fixValue = this.model.fixValueToPrecision.bind(this.model);

  private tipHiddenClass = 'slider__tip_hidden';

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
    this.view.setThumbThickness(this.model.viewValues.stepInPercents);
    this.view.on({ event: 'sliderPointerDown', handler: this.viewEventHandlers.sliderPointerDown });
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
    this.model.on({ event: 'isVerticalChanged', handler: listeners.changeOrientation })
      .on({ event: 'isIntervalChanged', handler: listeners.changeInterval })
      .on({ event: 'value1Changed', handler: listeners.makeSetValueAndPosition(1) })
      .on({ event: 'value2Changed', handler: listeners.makeSetValueAndPosition(2) })
      .on({ event: 'showProgressChanged', handler: listeners.changeShowProgress })
      .on({ event: 'showTipChanged', handler: listeners.changeShowTip })
      .on({ event: 'showScaleChanged', handler: listeners.changeShowScale })
      .on({ event: 'stepSizeChanged', handler: listeners.updateBounds })
      .on({ event: 'minValueChanged', handler: listeners.updateBounds })
      .on({ event: 'maxValueChanged', handler: listeners.updateBounds });
  }

  private initResizeObserver(): void {
    if (this.sliderResizeObserver === undefined) {
      this.sliderResizeObserver = new ResizeObserver(() => {
        if (this.subViews.scale !== undefined) {
          this.subViews.scale.optimizeValuesCount(this.positionAxis, this.sizeDimension);
        }
      });
    } else {
      this.sliderResizeObserver.unobserve(this.view.$elem[0]);
    }

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
      this.showJointOrSeparateTips();
    }
  }

  private appendSubViewElementToControlContainer(subViewName: keyof SubViews) {
    const subView = this.subViews[subViewName];
    if (subView !== undefined) {
      this.view.$controlContainer.append(subView.$elem);
    }
  }

  private createInitialSubViews() {
    this.appendSubViewElementToControlContainer('track');
    this.appendSubViewElementToControlContainer('thumb1');

    if (this.options.showTip) {
      this.createSubView('tip', 1);
    }

    if (this.options.isInterval) {
      this.createSubView('thumb');
      if (this.options.showTip) {
        this.createSubView('tip', 2);
        this.createSubView('tip', 3);
      }
    }

    if (this.options.showScale) {
      this.createSubView('scale');
    }
  }

  private createSubView(subViewName: 'tip', number: 1 | 2 | 3): void;
  private createSubView(subViewName: 'thumb'): void;
  private createSubView(subViewName: 'scale'): void;
  private createSubView(subViewName: 'tip' | 'thumb' | 'scale', number?: 1 | 2 | 3): void {
    switch (subViewName) {
      case 'tip': {
        if (number !== undefined) {
          this.subViews[`tip${number}`] = new TipView(number);
          this.appendSubViewElementToControlContainer(`tip${number}`);
        }
        break;
      }
      case 'thumb': {
        this.subViews.thumb2 = new ThumbView(2);
        this.appendSubViewElementToControlContainer('thumb2');
        break;
      }
      default: {
        this.subViews.scale = new ScaleView();
        const scaleElem = this.renderSubView('scale');
        if (scaleElem !== null) this.view.$elem.append(scaleElem);
        this.subViews.scale.on({
          event: 'scaleValueSelect',
          handler: this.viewEventHandlers.scaleValueSelect,
        });
      }
    }
  }

  // **************************************
  // *
  // * scale values creation methods start
  // *
  // **************************************
  private updateScale(): void {
    const { scale } = this.subViews;
    if (scale !== undefined) {
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

    const [lastScaleElem] = scale.scaleValueElements.slice(-1)[0];
    const lastScaleElemPosition = lastScaleElem.style.getPropertyValue('--scale-block-position');
    const lastScaleElemPositionIs100Percent = lastScaleElemPosition === '100%';
    if (!lastScaleElemPositionIs100Percent) {
      scale.scaleValueElements.push(
        this.makeNewScaleValueElement(
          this.options.maxValue,
          100,
        ),
      );
    }
  }

  private makeNewScaleValueElement(value: number, position: number): JQuery<HTMLDivElement> {
    return $(`<div class="slider__scale-block" style="--scale-block-position: ${position}%">
      <span class="slider__scale-text">${this.fixValue(value)}</span>
    </div>`);
  }
  // ***********************************
  // *
  // * scale values creation methods end
  // *
  // ***********************************

  private removeSubView(subViewName: keyof SubViews): void {
    const subView = this.subViews[subViewName];
    if (subView !== undefined) {
      subView.removeView();
      delete this.subViews[subViewName];
    }
  }

  private renderSubView(subViewName: keyof SubViews): JQuery<HTMLElement> | null {
    const subView = this.subViews[subViewName];
    if (subView !== undefined) {
      return subView.$elem;
    }
    return null;
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
    return this.fixValue(this.model.getValueByIndex(index));
  }

  private modelEventListeners = {
    updateBounds: (): void => {
      this.defineViewValues();
      this.view.setThumbThickness(this.model.viewValues.stepInPercents);
      if (this.options.showScale) {
        this.updateScale();
      }
    },

    changeOrientation: (isVertical: boolean): void => {
      this.updateDimensionAndAxis();
      this.view.toggleVertical(isVertical);
      if (this.options.showScale && this.subViews.scale !== undefined) {
        this.initResizeObserver();
      }

      if (this.options.isInterval) this.showJointOrSeparateTips();
    },

    changeInterval: (
      isInterval: boolean,
      options?: ChangeIntervalEventOptions,
    ): void => {
      if (isInterval) {
        this.createSubView('thumb');
        if (this.options.showTip) {
          this.createSubView('tip', 2);
          this.createSubView('tip', 3);
          this.setTipValue({
            number: 2,
            value: this.options.value2,
          });
        }
      } else {
        this.removeSubView('thumb2');
        this.removeSubView('tip2');
        this.removeSubView('tip3');
      }

      if (options?.checkTipsOverlap) this.showJointOrSeparateTips();
      this.view.toggleInterval(isInterval);
    },

    makeSetValueAndPosition: (number: 1 | 2) => ((
      value: number,
      options?: SetValueEventOptions,
    ): void => {
      if (this.options.showTip && options?.changeTipValue) {
        this.setTipValue({ number, value });
      }

      const position = this.getPositionByValue(value);
      if (!options?.onlySaveValue) {
        this.setPosition(number, position);
      }

      if (this.options.showTip && options?.checkTipsOverlap !== false) {
        this.showJointOrSeparateTips();
      }
    }),

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
          this.showJointOrSeparateTips();
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
    isThumbKeepsDistance: (newPosition: number): boolean => {
      const { thumbNumber } = this.currentThumbData;
      if (thumbNumber === 1) {
        const thumb2Position = this.model.viewValues.positions[2];
        return newPosition < thumb2Position;
      }

      const thumb1Position = this.model.viewValues.positions[1];
      return newPosition > thumb1Position;
    },

    fixIfOutOfRange: (position: number): number => {
      if (position < 0) return 0;
      if (position > 100) return 100;
      return position;
    },
  };

  private viewEventHandlers = {
    sliderPointerDown: (data: SliderPointerDownData): void => {
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
        const allowedPosition = this.findClosestAllowedPosition(position);
        const allowedValue = this.getValueByPosition(allowedPosition);

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

      this.view.controlContainerElem.addEventListener(
        'pointermove',
        this.viewEventHandlers.sliderPointerMove,
      );
      this.view.controlContainerElem.addEventListener(
        'pointerup',
        this.viewEventHandlers.sliderPointerUp,
        {
          once: true,
        },
      );
    },

    sliderPointerMove: (e: PointerEvent): void => {
      const newPosition = this.findClosestAllowedPosition(
        this.pixelsToPercentsOfSliderLength(e[this.offset]),
      );
      const { thumbNumber } = this.currentThumbData;
      const isThumbAwayFromOtherThumb = this.options.isInterval
        ? this.thumbChecks.isThumbKeepsDistance(newPosition)
        : true;
      if (isThumbAwayFromOtherThumb && newPosition !== this.currentThumbData.currentPosition) {
        const newValue = this.fixValue(this.getValueByPosition(newPosition));
        this.setPositionAndCurrentValue({
          number: thumbNumber,
          position: newPosition,
          value: newValue,
        });
      }
    },

    sliderPointerUp: (): void => {
      this.view.controlContainerElem.removeEventListener(
        'pointermove',
        this.viewEventHandlers.sliderPointerMove,
      );
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
  };

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

  private pixelsToPercentsOfSliderLength(pixels: number): number {
    const sliderLength = this.view.$controlContainer[0][this.sizeDimension];
    return this.thumbChecks.fixIfOutOfRange(((pixels / sliderLength) * 100));
  }

  private findClosestAllowedPosition(position: number): number {
    if (position > this.model.viewValues.penultimatePosition) {
      const finalHalfStep = (100 - this.model.viewValues.penultimatePosition) / 2;
      if (position < this.model.viewValues.penultimatePosition + finalHalfStep) {
        return this.model.viewValues.penultimatePosition;
      }
      return 100;
    }
    const step = this.model.viewValues.stepInPercents;
    return Math.round(position / step) * step;
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

  private areTipsOverlap(): boolean {
    const { tip1 } = this.subViews;
    const { tip2 } = this.subViews;
    if (tip1 !== undefined && tip2 !== undefined) {
      const [tip1Elem] = tip1.$elem;
      const [tip2Elem] = tip2.$elem;
      const tip1Bound = tip1Elem[this.positionDimension] + tip1Elem[this.sizeDimension];
      const tip2Bound = tip2Elem[this.positionDimension];
      if (tip1Bound >= tip2Bound) return true;
      return false;
    }

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
  }

  private setPosition(number: 1 | 2, position: number): void {
    this.currentThumbData.currentPosition = position;
    this.view.setPosition(number, position);
    this.model.viewValues.positions[number] = position;
  }

  private saveCurrentValue(number: 1 | 2, value: number): void {
    this.currentThumbData.currentValue = value;
    this.model.setValue(number, value, true);
  }

  private setTipValue(options: { number: 1 | 2 | 3, value: number | string }): void {
    const { number: tipNumber, value } = options;
    const tipName: `tip${'1' | '2' | '3'}` = `tip${tipNumber}`;
    const tip = this.subViews[tipName];
    if (tip !== undefined) {
      tip.setValue(value);
    }
  }

  private showJointOrSeparateTips() {
    if (this.options.isInterval && this.options.showTip) {
      if (this.areTipsOverlap()) {
        this.showJointTip();
      } else {
        this.showSeparateTips();
      }
    } else if (this.options.showTip) {
      const { tip1 } = this.subViews;
      if (tip1 !== undefined) {
        tip1.$elem.removeClass(this.tipHiddenClass);
      }
    }
  }

  private showJointTip() {
    const { tip1, tip2, tip3 } = this.subViews;
    if (tip1 !== undefined && tip2 !== undefined && tip3 !== undefined) {
      tip3.setValue(`${this.options.value1} – ${this.options.value2}`);
      tip3.$elem.removeClass(this.tipHiddenClass);
      tip1.$elem.addClass(this.tipHiddenClass);
      tip2.$elem.addClass(this.tipHiddenClass);
    }
  }

  private showSeparateTips() {
    const { tip1, tip2, tip3 } = this.subViews;
    if (tip1 !== undefined && tip2 !== undefined && tip3 !== undefined) {
      tip3.$elem.addClass(this.tipHiddenClass);
      tip1.$elem.removeClass(this.tipHiddenClass);
      tip2.$elem.removeClass(this.tipHiddenClass);
    }
  }

  private defineViewValues(): void {
    const { minValue, maxValue, stepSize } = this.options;
    const totalSliderRange = maxValue - minValue;
    this.model.viewValues.stepInPercents = (stepSize / totalSliderRange) * 100;
    this.model.allowedValuesCount = this.model.getAllowedValuesCount();
    this.model.penultimateValue = this.model.getPenultimateValue();
    this.model.viewValues.penultimatePosition = this.getPenultimatePosition();
  }
}

export default Presenter;
