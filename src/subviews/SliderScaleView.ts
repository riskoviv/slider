import EventEmitter from '../EventEmitter';

class SliderScaleView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__scale"></div>');

  private valueElements: JQuery<HTMLSpanElement>[];

  constructor(public allowedPositions: number[], private allowedRealValues: number[]) {
    super();

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
    const quotient = Math.round((this.allowedPositions.length / this.$elem.width()) * 3);
    console.log('quotient: ', `${quotient} = ${this.allowedPositions.length} / ${this.$elem.width()} * 3`);
    const lastElemIndex = this.allowedPositions.length - 1;

    this.valueElements = [];

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
          this.makeNewScaleValueElement(lastElemIndex, this.allowedPositions[lastElemIndex]),
        );
      }
    }
  }

  private makeNewScaleValueElement = (index: number, value: number) => (
    $(`
      <div class="slider__scale-block" data-index="${index}" style="left: ${value}%">
        <span class="slider__scale-text">${this.allowedRealValues[index]}</span>
      </div>
    `)
  );

  private optimizeValuesCount() {
    const $firstElem = this.valueElements[0];
    const $lastElem = this.valueElements[this.valueElements.length - 1];
    let $currentElem = $firstElem;

    this.valueElements.slice(1).forEach(($elem) => {
      const curElemRightBound = $currentElem.position().left + $currentElem.width();
      if ($elem) {
        if ($elem.position().left - 5 <= curElemRightBound) {
          if ($elem === $lastElem && $currentElem !== $firstElem) {
            $currentElem.addClass('slider__scale-block_unnumbered');
          } else if ($elem !== $lastElem) {
            $elem.addClass('slider__scale-block_unnumbered');
          }
        } else {
          $currentElem = $elem;
          $elem.removeClass('slider__scale-block_unnumbered');
        }
      }
    });
  }

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    const target = e.target.closest('.slider__scale-block');
    if (target) {
      this.emit('scaleValueSelect', this.allowedPositions[target.dataset.index]);
    }
  }
}

export default SliderScaleView;
