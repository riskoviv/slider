import BaseView from './subviews/BaseView';
import ThumbView from './subviews/ThumbView';
import ProgressView from './subviews/ProgressView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';
import utils from './utils';

type SubViewEventHandler = (options: {
  thumbNumber: 1 | 2,
  index: number,
  target: JQuery<HTMLElement>,
  number: 1 | 2,
}) => void;

type subViewClass =
  | typeof BaseView
  | typeof ThumbView
  | typeof ProgressView
  | typeof ScaleView
  | typeof TipView;

type subViewsData = {
  [subViewName in ViewType]: {
    constructorClass: subViewClass,
    parentElement: JQuery<HTMLElement>,
    handlers?: [
      {
        eventName: EventName,
        handler: SubViewEventHandler,
      },
    ],
  };
};

class Presenter {
  private options: IPluginOptions;

  readonly view: IView;

  private subViews: { [viewName: string]: InstanceType<subViewClass> } = {};

  private dimension: Dimension = 'width';

  private axis: Axis = 'left';

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
    this.updateAllowedPositionsArr();
    this.createInitialSubViews();
    this.insertSliderToContainer();
    this.bindModelEventListeners();
    this.updateScaleView();
  }

  private bindModelEventListeners(): void {
    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('isVerticalChanged', this.changeOrientation)
      .on('isIntervalChanged', this.changeInterval);
    if (this.options.showTip) {
      this.model.on('valueChanged', this.changeTipValue);
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
    const subViewsCreationData: [ViewType, (1 | 2)?][] = [
      ['base'],
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

  private createSubView(subViewName: ViewType, number?: 1 | 2): InstanceType<subViewClass> {
    const subViewCreationData: subViewsData = {
      base: {
        constructorClass: BaseView,
        parentElement: this.view.$controlContainer,
        handlers: [
          {
            eventName: 'basePointerDown',
            handler: this.basePointerDown,
          }
        ]
      },
      thumb: {
        constructorClass: ThumbView,
        parentElement: this.view.$controlContainer,
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
        parentElement: this.view.$elem,
        handlers: [
          {
            eventName: 'scaleValueSelect',
            handler: this.scaleValueSelect,
          },
        ],
      },
      tip: {
        constructorClass: TipView,
        parentElement: this.view.$controlContainer,
      },
    };

    const currentElementData = subViewCreationData[subViewName];
    let subViewFullName = subViewName;
    const SubViewClass = currentElementData.constructorClass;
    switch (SubViewClass) {
      case ThumbView || TipView:
        subViewFullName += number ?? 1;
        this.subViews[subViewFullName] = new SubViewClass(number ?? 1);
        break;
      case BaseView || ProgressView || ScaleView:
        this.subViews[subViewFullName] = new SubViewClass();
        break;
      default:
        break;
    }

    currentElementData.parentElement.append(this.renderSubView(subViewFullName));

    currentElementData.handlers?.forEach(({ eventName, handler }) => {
      this.subViews[subViewFullName].on(eventName, handler);
    });

    return this.subViews[subViewFullName];
  }

  private subViewExists(subViewName: keyof ViewClasses): boolean {
    return this.subViews[subViewName] !== undefined;
  }

  private removeSubView(subViewName: keyof ViewClasses): void {
    if (this.subViewExists(subViewName)) {
      this.subViews[subViewName].removeView();
      delete this.subViews[subViewName];
    }
  }

  private renderSubView(subViewName: string): JQuery<HTMLElement> {
    return this.subViews[subViewName].render();
  }

  private insertSliderToContainer(): void {
    this.$pluginRootElem.append(this.view.$elem);
  }

  /**
   * Model listeners
   */

  private changeStepSize = () => {
    this.updateAllowedPositionsArr();
    if (this.options.showScale) {
      this.updateScaleView();
    }
  }

  private changeOrientation = (isVertical: boolean) => {
    this.view.toggleVertical(isVertical);
  }

  private changeInterval(isInterval: boolean) {
    if (isInterval) {
      if (this.subViews.thumb2 === undefined) {
        this.subViews.thumb2 = new ThumbView(2);
        this.view.$controlContainer.append(this.subViews.thumb2.render());
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
  ): void => {
    this.model.setValue(options.thumbNumber, options.index);
  }

  private changeTipValue = (options: { tipNumber: 1 | 2, value: number }) => {
    const { tipNumber, value } = options;
    this.subViews[`tip${tipNumber}`].setValue?.(value);
  }

  private scaleValueSelect = (options: { index: number }): void => {
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

  private updateAllowedPositionsArr(): void {
    this.fillAllowedPositionsArr({
      minValue: this.options.minValue,
      maxValue: this.options.maxValue,
      stepSize: this.options.stepSize,
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
   * TODO Fix BaseView helper functions
   */

  private thumbChecks = {
    isCursorMovedHalfStep: (thumb: IThumbView, position: number) => (
      Math.abs(position - thumb.currentPosition) > this.params.stepSizeInPercents / 2
    ),

    isCursorOnStepPosition: (position: number) => (
      this.model.allowedPositions.includes(position)
        && position !== this.currentPosition
    ),

    isHandleKeepsDistance: (thumbNumber: 1 | 2, newPosition: number): boolean => {
      if (thumbNumber === 1) {
        return newPosition <= this.params.positions[2] - this.params.stepSizeInPercents;
      }

      return newPosition >= this.params.positions[1] + this.params.stepSizeInPercents;
    },

    isHandleInRange: (position: number) => position >= 0 && position <= 100,
  }

  private basePointerDown = (data: {
    target: JQuery<HTMLElement>,
    number: 1 | 2,
  }): void => {
    const { target, number } = data;
    if (this.subViews.base instanceof BaseView) {
      this.subViews.base.elem.addEventListener('pointermove', this.basePointerMove);
      this.subViews.base.elem.addEventListener('pointerup', this.basePointerUp);
    }
  }

  private basePointerMove(e: PointerEvent): void {
    const newPosition = this.pixelsToPercentsOfBaseLength(
      this.options.isVertical ? e.offsetY : e.offsetX,
    );

    const movedHalfStep = this.thumbChecks.isCursorMovedHalfStep(newPosition);
    const onStepPosition = this.isCursorOnStepPosition(newPosition);

    if (movedHalfStep || onStepPosition) {
      const thumbInRange = this.isHandleInRange(newPosition);
      if (thumbInRange) {
        const isHandleAwayFromOtherHandle = this.params.isInterval
          ? this.isHandleKeepsDistance(newPosition)
          : true;

        if (thumbInRange && isHandleAwayFromOtherHandle) {
          this.setPositionAndCurrentValue(
            newPosition,
            movedHalfStep,
          );
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
