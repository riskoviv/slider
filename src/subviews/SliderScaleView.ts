import EventEmitter from '../EventEmitter';

class SliderScaleView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__scale"></div>');

  private valueElements: JQuery<HTMLSpanElement>[];

  constructor(public allowedValues: number[], private allowedRealValues: number[]) {
    super();

    this.valueElements = this.allowedValues.map((value, index) => (
      $(`
        <span class="slider__scale-value" data-index="${index}" style="left: ${value}%">
          ${this.allowedRealValues[index]}
        </span>
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
          $currentElem.addClass('slider__scale-value_invisible');
        } else if ($elem !== $lastElem) {
          $elem.addClass('slider__scale-value_invisible');
        }
      } else {
        $currentElem = $elem;
        $elem.removeClass('slider__scale-value_invisible');
      }
    });
  }

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    if (e.target.classList.contains('slider__scale-value')) {
      this.emit('scaleValueSelect', this.allowedValues[e.target.dataset.index]);
    }
  }
}

export default SliderScaleView;
