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
  }

  private bindModelEventListeners(): void {
    const listeners = this.modelEventListeners;
    this.model.on('stepSizeChanged', listeners.changeStepSize)
      .on('isVerticalChanged', listeners.changeOrientation)
      .on('isIntervalChanged', listeners.changeInterval);
    if (this.options.showTip) {
      this.model.on('valueChanged', listeners.changeTipValue);
    }
  }

  private updateDimensionAndAxis() {
    this.dimension = this.options.isVertical ? 'height' : 'width';
    this.axis = this.options.isVertical ? 'top' : 'left';
  }

  private updateScaleView() {
    // probably there will be needed a setTimeout
    // because elements are not located on page yet
    // and this function needs actual scale element's size
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

  private modelEventListeners = {
    changeStepSize: (): void => {
      this.updateAllowedPositionsArr();
      if (this.options.showScale) {
        this.updateScaleView();
      }
    },

    changeOrientation: (isVertical: boolean): void => {
      this.view.toggleVertical(isVertical);
    },

    changeInterval: (isInterval: boolean): void => {
      if (isInterval) {
        this.createSubView('thumb', 2);
        if (this.options.showTip) {
          this.createSubView('tip', 2);
        }
      } else {
        this.removeSubView('thumb2');
        this.removeSubView('tip2');
      }
    },

    changeTipValue: (options: { tipNumber: 1 | 2, value: number }): void => {
      const { tipNumber, value } = options;
      const tipName = tipNumber === 1 ? 'tip1' : 'tip2';
      const tip = this.subViews[tipName];
      if (tip instanceof TipView) {
        tip.setValue(value);
      }
    },
  };

  /**
   * TODO Fix BaseView helper functions
   */

  private thumbChecks = {
    isCursorMovedHalfStep: (position: number) => {
      if (this.currentThumbData?.currentPosition !== undefined) {
        return Math.abs(position - this.currentThumbData.currentPosition)
          > this.model.viewValues.stepInPercents / 2;
      }
      return false;
    },

    isCursorOnStepPosition: (position: number) => (
      this.model.allowedPositions.includes(position)
        && position !== this.currentThumbData?.currentPosition
    ),

    isHandleKeepsDistance: (thumbNumber: 1 | 2, newPosition: number): boolean => {
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

    isHandleInRange: (position: number) => position >= 0 && position <= 100,
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
          };
          this.setPositionAndCurrentValue({
            number: chosenThumb,
            allowedPosition: this.model.allowedPositions[allowedIndex],
            findClosest: false,
          });
        }
      }

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
        this.currentThumbData = {
          thumbNumber,
          currentPosition: position,
        };
      } else {
        this.currentThumbData = {
          thumbNumber,
          currentPosition: position,
        };
      }

      this.setPositionAndCurrentValue({
        number: thumbNumber,
        allowedPosition: position,
        findClosest: false,
      });
    },
  }

  private currentThumbData: {
    thumbNumber: 1 | 2,
    currentPosition?: number,
  } = { thumbNumber: 1 };

  private basePointerMove(e: PointerEvent): void {
    const newPosition = this.pixelsToPercentsOfBaseLength(
      this.options.isVertical ? e.offsetY : e.offsetX,
    );

    const movedHalfStep = this.thumbChecks.isCursorMovedHalfStep(newPosition);
    const onStepPosition = this.thumbChecks.isCursorOnStepPosition(newPosition);

    if (movedHalfStep || onStepPosition) {
      const thumbInRange = this.thumbChecks.isHandleInRange(newPosition);
      if (thumbInRange) {
        const isHandleAwayFromOtherHandle = this.options.isInterval
          ? this.thumbChecks.isHandleKeepsDistance(
            this.currentThumbData?.thumbNumber,
            newPosition,
          )
          : true;

        if (thumbInRange && isHandleAwayFromOtherHandle) {
          this.setPositionAndCurrentValue({
            number: this.currentThumbData.thumbNumber,
            allowedPosition: newPosition,
            findClosest: movedHalfStep,
          });
        }
      }
    }

    this.elem.addEventListener('pointerup', this.basePointerUp, { once: true });
  }

  private basePointerUp(e: PointerEvent): void {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.elem.removeEventListener('pointermove', this.basePointerMove);
  }

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const offset = this.options.isVertical ? 'offsetHeight' : 'offsetWidth';
    const baseLength = this.view.$controlContainer.get()[0][offset];
    return Number(((pixels / baseLength) * 100).toFixed(1));
  }

  private findClosestAllowedPosition(position: number): number | undefined {
    const posToRight = this.model.allowedPositions.find((pos) => pos > position);
    if (posToRight !== undefined) {
      return (posToRight - position) < this.model.viewValues.halfStepInPercents
        ? posToRight
        : posToRight - this.model.viewValues.stepInPercents;
    }
    return undefined;
  }

  private setPositionAndCurrentValue(options: {
    number: 1 | 2 | undefined,
    allowedPosition: number,
    findClosest: boolean
  }): void {
    const { allowedPosition, findClosest } = options;
    const thumbData = this.currentThumbData;
    const number = options.number ?? thumbData.thumbNumber;
    thumbData.currentPosition = findClosest
      ? this.findClosestAllowedPosition(allowedPosition)
      : allowedPosition;
    if (thumbData.currentPosition !== undefined) {
      this.view.setPosition(number, thumbData.currentPosition);
      this.model.viewValues.positions[number] = thumbData.currentPosition;
      this.model.setValue(
        number,
        this.model.allowedPositions.indexOf(thumbData.currentPosition),
      );
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

    this.model.viewValues.stepInPercents = (stepSize / totalSliderRange) * 100;
    this.model.viewValues.halfStepInPercents = this.model.viewValues.stepInPercents / 2;
    this.model.allowedPositions.length = 0;

    for (let i = 0; i <= 100; i += this.model.viewValues.stepInPercents) {
      this.model.allowedPositions.push(
        Number(i.toFixed(positionAccuracy < 1 ? 1 : positionAccuracy)),
      );
    }

    if (this.model.allowedPositions.slice(-1)[0] !== 100) {
      this.model.allowedPositions.push(100);
    }
  }
}

export default Presenter;
