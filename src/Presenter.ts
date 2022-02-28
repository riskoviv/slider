import BaseView from './subviews/BaseView';
import ThumbView from './subviews/ThumbView';
import ProgressView from './subviews/ProgressView';
import ScaleView from './subviews/ScaleView';
import View from './View';
import TipView from './subviews/TipView';
import utils from './utils';

type stateOption = Omit<IPluginStateOptions, 'isVertical'>;

type optionalSubViewsData = {
  [stateOptionName in keyof stateOption]: typeof ProgressView
    | typeof ScaleView
    | typeof TipView
    | typeof ThumbView
};

type subViewsData = {
  [stateOptionName in keyof stateOption]: {
    className: typeof ProgressView
    | typeof ScaleView
    | typeof TipView
    | typeof ThumbView,
    parentElement?: JQuery<HTMLElement>,
    events?: [
      {
        eventName: EventName,
        listener: EventHandler<{
          thumbNumber: 1 | 2;
          index: number;
        }>,
      }
    ]
  }
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

  private fullyCreateSubViews(): void {
    const subViewsData: subViewsData = {
      isInterval: {
        className: ThumbView,
        events: [
          {
            eventName: 'thumbValueChange',
            listener: this.thumbValueChange,
          },
        ],
      },
      showProgressBar: {
        className: ProgressView,
        parentElement: this.subViews.base.$elem,
      },
      showScale: {
        className: ScaleView,
        parentElement: this.sliderView.$elem,
        events: [
          {
            eventName: 'scaleValueSelect',
            listener: this.scaleValueSelect,
          },
        ],
      },
      showTip: {
        className: TipView,
      },
    };
  }

  private fullyCreateSubView(subViewName: ViewType, number: 1 | 2): void {

  }

  private createSubViews(): void {
    this.subViews = {
      base: new BaseView(),
      thumb1: new ThumbView(1),
    };

    // Этот список условий заменяет 2 функции (весь код выше и createSubView)
    // Но мне нужно создать универсальную функцию, которая будет выполнять
    // полный комплекс действий для сознания subView
    // на основе этих функций и также рендеринг и привязку обработчиков
    if (this.options.showTip) {
      this.subViews.tip1 = new TipView(1);
      if (this.options.isInterval) {
        this.subViews.tip2 = new TipView(2);
      }
    }

    if (this.options.isInterval) {
      this.subViews.thumb2 = new ThumbView(2);
    }

    if (this.options.showProgressBar) {
      this.subViews.progress = new ProgressView();
    }

    if (this.options.showScale) {
      this.subViews.scale = new ScaleView();
    }

    const optionalSubviews: optionalSubViewsData = {
      isInterval: ThumbView,
      showProgressBar: ProgressView,
      showScale: ScaleView,
      showTip: TipView,
    };

    utils.getEntriesWithTypedKeys(optionalSubviews)
      .forEach(([stateCondition, subViewClass]) => {
        if (this.model.options[stateCondition]) {
          this.createSubView(subViewClass);
        }
      });
  }

  private createSubView(subViewClass: TypeOfValues<optionalSubViewsData>): void {
    const SubView = subViewClass;
    switch (SubView) {
      case ProgressView || ScaleView: {
        const name = SubView.name.slice(0, -4).toLowerCase();
        this.subViews[name] = new SubView();
        break;
      }
      case ThumbView:
        this.subViews.thumb2 = new SubView(2);
        break;
      case TipView:
        this.subViews.tip1 = new SubView(1);
        if (this.options.isInterval) {
          this.subViews.tip2 = new SubView(2);
        }

        break;
      default:
        break;
    }
  }

  private appendSubViewsToSlider(): void {
    const subViewsParentElements = [
      {
        element: this.sliderView.$controlContainer,
        children: ['BaseView', 'ThumbView', 'TipView'],
      },
      {
        element: this.subViews.base.$elem,
        children: ['ProgressView'],
      },
      {
        element: this.sliderView.$elem,
        children: ['ScaleView'],
      },
    ];
    const subViewsInstances = Object.values(this.subViews);

    subViewsParentElements.forEach((parent) => {
      subViewsInstances.forEach((instance) => {
        if (parent.children.includes(instance.constructor.name)) {
          parent.element.append(instance.render());
        }
      });
    });
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

  private bindEventListeners() {
    this.model.on('stepSizeChanged', this.changeStepSize)
      .on('isVerticalChanged', this.changeOrientation)
      .on('isIntervalChanged', this.changeInterval);

    if (this.options.showTip) {
      this.model.on('valueChanged', this.changeTipValue);
    }

    type subViewListenersObj = {
      [subViewType in ViewType]?: [
        {
          eventName: EventName,
          listener: EventHandler<{
            thumbNumber: 1 | 2;
            index: number;
          }>,
        },
      ];
    }

    const subViewsListeners: subViewListenersObj = {
      thumb: [
        {
          eventName: 'thumbValueChange',
          listener: this.thumbValueChange,
        },
      ],
      scale: [
        {
          eventName: 'scaleValueSelect',
          listener: this.scaleValueSelect,
        },
      ],
    };

    Object.entries(this.subViews).forEach(([name, subView]) => {
      Object.entries(subViewsListeners).forEach(([subViewType, events]) => {
        if (name.startsWith(subViewType)) {
          events.forEach((event) => {
            subView.on(event.eventName, event.listener);
          });
        }
      });
    });
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
