import EventEmitter from '../EventEmitter';

class SliderScaleView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__scale"></div>');

  private valueElements: JQuery<HTMLSpanElement>[];

  constructor(public allowedValues: number[], private allowedRealValues: number[]) {
    super();

    this.valueElements = this.allowedValues.map((value, index) => (
      $(`
        <div class="slider__scale-block" data-index="${index}" style="left: ${value}%">
          <span class="slider__scale-text">${this.allowedRealValues[index]}</span>
        </div>
      `)
    ));

    this.$elem.append(this.valueElements);

    setTimeout(() => {
      this.optimizeValuesCount();
    }, 0);

    new ResizeObserver(() => {
      this.optimizeValuesCount();
    }).observe(this.$elem.get()[0]);

    this.$elem.on('click', this.scaleValueClick);
  }

  private optimizeValuesCount() {
    const $lastElem = this.valueElements[this.valueElements.length - 1];
    let $currentElem = this.valueElements[0];
    this.valueElements.slice(1).forEach(($elem) => {
      const curElemRightBound = $currentElem.position().left + $currentElem.width();
      if ($elem.position().left - 5 <= curElemRightBound) {
        if ($elem === $lastElem && $currentElem !== this.valueElements[0]) {
          $currentElem.addClass('slider__scale-block_invisible');
        } else if ($elem !== $lastElem) {
          $elem.addClass('slider__scale-block_invisible');
        }
      } else {
        $currentElem = $elem;
        $elem.removeClass('slider__scale-block_invisible');
      }
    });
  }

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    const target = e.target.closest('.slider__scale-block');
    if (target) {
      this.emit('scaleValueSelect', this.allowedValues[target.dataset.index]);
    }
  }
}

export default SliderScaleView;
