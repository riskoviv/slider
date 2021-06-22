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
    }, 1000);

    setTimeout(() => {
      this.optimizeValuesCount();
    }, 2000);

    // const scaleResizeObserver = new ResizeObserver((entries) => {
    //   setTimeout(() => {
    //     this.optimizeValuesCount();
    //   }, 2000);
    // }).observe(this.$elem.get()[0]);

    this.$elem.on('click', this.scaleValueClick);
  }

  private optimizeValuesCount() {
    // while (this.hasOverlappingValues()) {
    let $lastOversteppedEl: JQuery<HTMLSpanElement>;

    this.valueElements.slice(1).forEach(($valueEl, i, valueElements) => {
      const currentElRightBound = $valueEl.position().left + $valueEl.width();
      const $nextEl = valueElements[i + 1]; // find next el w/o 'hidden' here
      const isLastEl = i === valueElements.length - 1;
      const hasNext = $nextEl !== undefined && !$nextEl.data('hidden');
      const nextElPosition = hasNext ? $nextEl.position().left : null;
      const notOversteppedAndHasNext = ($valueEl !== $lastOversteppedEl && hasNext);
      const overlapsNext = nextElPosition > 0 && currentElRightBound >= nextElPosition;

      if (notOversteppedAndHasNext && overlapsNext) {
        console.log(currentElRightBound, nextElPosition);
        $lastOversteppedEl = $nextEl;
        $valueEl.hide().data('hidden', 'true');
      } /* else if (!overlapsNext) {
        $valueEl.show().data('hidden', 'false');
      } */
    });
    // }
  }

  private hasOverlappingValues(): boolean {
    this.valueElements
      .forEach(($valueEl, i) => {
        if (
          this.valueElements[i + 1] !== undefined
          && ($valueEl.position().left + $valueEl.width()) >= this.valueElements[i + 1].position()?.left
        ) {
          return true;
        }
        return false;
      });
    return false;
  }

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    if (e.target.classList.contains('slider__scale-value')) {
      this.emit('scaleValueSelect', this.allowedValues[e.target.dataset.index]);
    }
  }
}

export default SliderScaleView;
