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

    // const scaleResizeObserver = new ResizeObserver((entries) => {
    //   this.optimizeValuesCount();
    // }).observe(this.$elem.get()[0]);

    this.$elem.on('click', this.scaleValueClick);
  }

  private optimizeValuesCount() {
    this.valueElements
      .forEach(($valueEl) => {
        if ($valueEl.next().length !== 0
          && $valueEl.position().left + $valueEl.width() > $valueEl.next().position()?.left) {
          $valueEl.hide();
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
