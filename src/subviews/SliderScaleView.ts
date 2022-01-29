import EventEmitter from '../EventEmitter';

class SliderScaleView extends EventEmitter {
  $elem = $('<div class="slider__scale"></div>');

  valueElements: JQuery<HTMLSpanElement>[] = [];

  private axis: SliderAxis;

  private dimension: SliderDimension;

  constructor(
    public allowedPositions: number[],
    private allowedRealValues: number[],
    private isVertical: boolean,
  ) {
    super();
    this.axis = this.isVertical ? 'top' : 'left';
    this.dimension = this.isVertical ? 'height' : 'width';

    setTimeout(() => {
      this.createValuesElements();
      this.$elem.append(this.valueElements);
      this.optimizeValuesCount();
      new ResizeObserver(() => {
        this.optimizeValuesCount();
      }).observe(this.$elem.get()[0]);
    }, 0);

    this.$elem.on('click', this.scaleValueClick);
  }

  private createValuesElements = () => {
    const scaleSize = this.$elem.width() || 1;
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

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    const target: HTMLDivElement | undefined = e.target.closest('.slider__scale-text')?.parentNode;
    if (target !== undefined) {
      this.emit('scaleValueSelect', Number(target.dataset.index));
    }
  }
}

export default SliderScaleView;
