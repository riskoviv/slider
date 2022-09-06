/* eslint-disable no-dupe-class-members */
/* eslint-disable lines-between-class-members */
import $ from 'jquery';

import View from './View';
import TrackView from './subviews/TrackView';
import ThumbView from './subviews/ThumbView';
import ScaleView from './subviews/ScaleView';
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

type StateChangeHandler = {
  stateChangeEvent: StateEvent,
  stateChangeHandler: StateHandler,
};

type NumericBoundsChangeHandler = {
  boundsChangeEvents: ValueEvent[],
  boundsChangeHandler: (() => void),
};

type ValueChangeHandler = {
  valueChangeEvents: ValueEvent[],
  valueNumbers: [1, 2],
  makeValueChangeHandler: (number: 1 | 2) => ValueHandler
};

class Presenter implements IPresenter {
  readonly view: IView;

  private options: SliderOptions;

  private subViews: SubViews = {
    track: new TrackView(),
    thumb1: new ThumbView(),
  };

  private sizeDimension: SizeDimension = 'offsetWidth';

  private positionDimension: PositionDimension = 'offsetLeft';

  private positionAxis: PositionAxis = 'left';

  private offset: 'offsetX' | 'offsetY' = 'offsetX';

  private sliderResizeObserver?: ResizeObserver;

  private fixValue = this.model.fixValueToPrecision.bind(this.model);

  private tipHiddenClass = 'slider__tip_hidden';

  private resizeObserverActive = false;

  constructor(
    private readonly $pluginRootElem: JQuery,
    private readonly model: IModel,
  ) {
    this.options = this.model.options;
    this.updateDimensionAndAxis();
    this.defineViewValues();
    this.view = this.createView();
    this.createInitialSubViews();
    this.insertSliderToContainer();
    this.bindModelEventListeners();
    this.checkThatScaleAndResizeObserverIsNeeded();
    this.passInitialValuesToSubViews(this.options.value1, this.options.value2);
  }

  private isTwoTips() {
    return this.options.showTip && this.options.isInterval;
  }

  private checkThatScaleAndResizeObserverIsNeeded() {
    if (this.options.showScale) this.updateScale();
    const needToActivateResizeObserverForTwoTips = this.isTwoTips() && !this.resizeObserverActive;
    if (needToActivateResizeObserverForTwoTips) {
      this.activateResizeObserver();
    }
  }

  private createView(): View {
    const view = new View({
      isVertical: this.options.isVertical,
      isInterval: this.options.isInterval,
      showProgressBar: this.options.showProgressBar,
    });
    view.setThumbThickness(this.model.viewValues.stepInPercents);
    view.on({ event: 'sliderPointerDown', handler: this.viewEventHandlers.sliderPointerDown });
    return view;
  }

  private bindModelEventListeners(): void {
    this.stateChangeHandlers.forEach(({ stateChangeEvent, stateChangeHandler }) => {
      this.model.on({ event: stateChangeEvent, handler: stateChangeHandler });
    });

    const { boundsChangeEvents, boundsChangeHandler } = this.numericBoundsChangeHandler;
    boundsChangeEvents.forEach((boundChangeEvent) => {
      this.model.on({ event: boundChangeEvent, handler: boundsChangeHandler });
    });

    const { valueChangeEvents, valueNumbers, makeValueChangeHandler } = this.valueChangeHandler;
    valueChangeEvents.forEach((valueChangeEvent, index) => {
      this.model.on({
        event: valueChangeEvent,
        handler: makeValueChangeHandler(valueNumbers[index]),
      });
    });
  }

  private activateResizeObserver(): void {
    if (this.sliderResizeObserver === undefined) {
      this.sliderResizeObserver = new ResizeObserver(() => {
        if (this.subViews.scale !== undefined) {
          this.subViews.scale.optimizeValuesCount(this.positionAxis, this.sizeDimension);
        }

        if (this.options.showTip) this.showJointOrSeparateTips();
      });
    } else {
      this.sliderResizeObserver.unobserve(this.view.$elem[0]);
    }

    this.sliderResizeObserver.observe(this.view.$elem[0]);
    this.resizeObserverActive = true;
  }

  private deactivateResizeObserver(): void {
    this.sliderResizeObserver?.disconnect();
    this.resizeObserverActive = false;
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

  private passInitialValuesToSubViews(value1: number, value2: number) {
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
  private createSubView(subViewName: 'tip' | 'thumb' | 'scale', number: 1 | 2 | 3 = 1): void {
    switch (subViewName) {
      case 'tip': {
        this.subViews[`tip${number}`] = new TipView(number);
        this.appendSubViewElementToControlContainer(`tip${number}`);
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

  // #region scale values creation methods
  private updateScale(): void {
    const { scale } = this.subViews;
    if (scale !== undefined) {
      this.createScaleValuesElements(scale);
      scale.insertScaleValueElements();
      if (this.resizeObserverActive) {
        scale.optimizeValuesCount(this.positionAxis, this.sizeDimension);
      } else {
        this.activateResizeObserver();
      }
    }
  }

  private createScaleValuesElements(scaleView: ScaleView): void {
    const scale = scaleView;
    const scaleSize = this.$pluginRootElem[0][this.sizeDimension];
    const { allowedValuesCount } = this.model;
    const quotient = Math.round((allowedValuesCount / scaleSize) * 5);
    const lastElemIndex = allowedValuesCount - 1;
    const isEveryValueAllowed = [0, 1].includes(quotient);

    if (isEveryValueAllowed) {
      scale.scaleValueElements = this.getScaleValueElements(lastElemIndex);
    } else {
      scale.scaleValueElements = this.getScaleValueElements(lastElemIndex, quotient);
    }
  }

  private getScaleValueElements(lastElemIndex: number, quotient = 1): JQuery<HTMLDivElement>[] {
    const scaleValueElements: JQuery<HTMLDivElement>[] = [];
    for (let index = 0; index <= lastElemIndex; index += quotient) {
      const value = this.model.getValueByIndex(index);
      const position = this.getPositionByIndex(index);
      scaleValueElements.push(this.makeNewScaleValueElement(value, position));
    }
    if (scaleValueElements.at(-1)?.text().trim() !== String(this.options.maxValue)) {
      scaleValueElements.push(this.makeNewScaleValueElement(this.options.maxValue, 100));
    }
    return scaleValueElements;
  }

  private makeNewScaleValueElement(value: number, position: number): JQuery<HTMLDivElement> {
    return $(`<div class="slider__scale-block" style="--scale-block-position: ${position}%">
      <span class="slider__scale-text">${this.fixValue(value)}</span>
    </div>`);
  }
  // #endregion scale values creation methods

  private removeSubView(subViewName: keyof SubViews): void {
    const subView = this.subViews[subViewName];
    if (subView !== undefined) {
      subView.removeView();
      delete this.subViews[subViewName];
    }
  }

  private renderSubView(subViewName: keyof SubViews): JQuery | null {
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
    const position = this.model.viewValues.stepInPercents * index;
    return position > 100 ? 100 : position;
  }

  private getValueByPosition(position: number): number {
    if (position === 100) return this.options.maxValue;
    const index = this.getIndexByPosition(position);
    return this.fixValue(this.model.getValueByIndex(index));
  }

  private stateChangeHandlers: StateChangeHandler[] = [
    {
      stateChangeEvent: 'isVerticalChanged',
      stateChangeHandler: (isVertical: boolean): void => {
        this.updateDimensionAndAxis();
        this.view.toggleVertical(isVertical);
        const resizeObserverIsNeeded = this.options.showScale || this.isTwoTips();
        if (resizeObserverIsNeeded) {
          this.activateResizeObserver();
        }

        if (this.options.isInterval) this.showJointOrSeparateTips();
      },
    },
    {
      stateChangeEvent: 'isIntervalChanged',
      stateChangeHandler: (
        isInterval: boolean,
        options: ChangeIntervalEventOptions = { checkTipsOverlap: false },
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
            if (!this.resizeObserverActive) {
              this.activateResizeObserver();
            }
          }
        } else {
          this.removeSubView('thumb2');
          this.removeSubView('tip2');
          this.removeSubView('tip3');
          const resizeObserverIsNotNeeded = !this.options.showScale && this.resizeObserverActive;
          if (resizeObserverIsNotNeeded) {
            this.deactivateResizeObserver();
          }
        }

        if (options.checkTipsOverlap) this.showJointOrSeparateTips();
        this.view.toggleInterval(isInterval);
      },
    },
    {
      stateChangeEvent: 'showProgressChanged',
      stateChangeHandler: (showProgress: boolean): void => {
        this.view.toggleProgressBar(showProgress);
      },
    },
    {
      stateChangeEvent: 'showTipChanged',
      stateChangeHandler: (showTip: boolean): void => {
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
            if (!this.resizeObserverActive) {
              this.activateResizeObserver();
            }
          }
        } else {
          this.removeSubView('tip1');
          if (this.options.isInterval) {
            this.removeSubView('tip2');
            this.removeSubView('tip3');
          }

          const noScaleButResizeObserverIsActive = !this.options.showScale
            && this.resizeObserverActive;
          if (noScaleButResizeObserverIsActive) {
            this.deactivateResizeObserver();
          }
        }
      },
    },
    {
      stateChangeEvent: 'showScaleChanged',
      stateChangeHandler: (showScale: boolean): void => {
        if (showScale) {
          this.createSubView('scale');
          this.updateScale();
        } else {
          this.removeSubView('scale');
          const allowedToDeactivateResizeObserver = this.resizeObserverActive
            && !this.isTwoTips();
          if (allowedToDeactivateResizeObserver) {
            this.deactivateResizeObserver();
          }
        }
      },
    },
  ];

  private numericBoundsChangeHandler: NumericBoundsChangeHandler = {
    boundsChangeEvents: ['stepSizeChanged', 'minValueChanged', 'maxValueChanged'],
    boundsChangeHandler: (): void => {
      this.defineViewValues();
      this.view.setThumbThickness(this.model.viewValues.stepInPercents);
      if (this.options.showScale) {
        this.updateScale();
      }
    },
  };

  private valueChangeHandler: ValueChangeHandler = {
    valueChangeEvents: ['value1Changed', 'value2Changed'],
    valueNumbers: [1, 2],
    makeValueChangeHandler: (number: 1 | 2): ValueHandler => {
      const setValueAndPosition: ValueHandler = (
        value: number,
        options: SetValueEventOptions = {},
      ): void => {
        const {
          changeTipValue = true,
          onlySaveValue = false,
          checkTipsOverlap = true,
        } = options;
        const needToChangeTipValue = this.options.showTip && changeTipValue;
        if (needToChangeTipValue) {
          this.setTipValue({ number, value });
        }

        if (!onlySaveValue) {
          const position = this.getPositionByValue(value);
          this.setPosition(number, position);
        }

        const needToCheckTipsOverlap = this.options.showTip && checkTipsOverlap !== false;
        if (needToCheckTipsOverlap) {
          this.showJointOrSeparateTips();
        }
      };
      return setValueAndPosition;
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
        const thumbNumberIs1Or2 = thumbNumber === 1 || thumbNumber === 2;
        if (thumbNumberIs1Or2) {
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
        const allowedToChangeThumbPosition = (
          allowedPosition !== this.currentThumbData.currentPosition
          && allowedValue !== this.currentThumbData.currentValue
        );
        if (allowedToChangeThumbPosition) {
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
      const allowedToChangeThumbPosition = (
        newPosition !== this.currentThumbData.currentPosition
        && isThumbAwayFromOtherThumb
      );
      if (allowedToChangeThumbPosition) {
        const newValue = this.getValueByPosition(newPosition);
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
    const bothTipsExists = tip1 !== undefined && tip2 !== undefined;
    if (bothTipsExists) {
      const [tip1Elem] = tip1.$elem;
      const [tip2Elem] = tip2.$elem;
      const tip1Bound = tip1Elem[this.positionDimension] + tip1Elem[this.sizeDimension];
      const tip2Bound = tip2Elem[this.positionDimension];
      if (tip1Bound >= tip2Bound) return true;
      return false;
    }

    return false;
  }

  private setPositionAndCurrentValue({
    number,
    position,
    value,
  }: {
    number: 1 | 2,
    position: number,
    value: number,
  }): void {
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

  private setTipValue({
    number: tipNumber,
    value,
  }: {
    number: 1 | 2 | 3,
    value: number | string,
  }): void {
    const tipName: `tip${'1' | '2' | '3'}` = `tip${tipNumber}`;
    const tip = this.subViews[tipName];
    if (tip !== undefined) {
      tip.setValue(value);
    }
  }

  private showJointOrSeparateTips() {
    if (this.isTwoTips()) {
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
    const allThreeTipsExists = tip1 !== undefined && tip2 !== undefined && tip3 !== undefined;
    if (allThreeTipsExists) {
      tip3.setValue(`${this.options.value1} – ${this.options.value2}`);
      tip3.$elem.removeClass(this.tipHiddenClass);
      tip1.$elem.addClass(this.tipHiddenClass);
      tip2.$elem.addClass(this.tipHiddenClass);
    }
  }

  private showSeparateTips() {
    const { tip1, tip2, tip3 } = this.subViews;
    const allThreeTipsExists = tip1 !== undefined && tip2 !== undefined && tip3 !== undefined;
    if (allThreeTipsExists) {
      tip3.$elem.addClass(this.tipHiddenClass);
      tip1.$elem.removeClass(this.tipHiddenClass);
      tip2.$elem.removeClass(this.tipHiddenClass);
    }
  }

  private defineViewValues(): void {
    const { minValue, maxValue, stepSize } = this.options;
    const totalSliderRange = maxValue - minValue;
    this.model.viewValues.stepInPercents = (stepSize / totalSliderRange) * 100;
    this.model.viewValues.penultimatePosition = this.getPenultimatePosition();
  }
}

export default Presenter;
