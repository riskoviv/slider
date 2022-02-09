import View from '../View';

class ScaleView extends View {
  valueElements: JQuery<HTMLSpanElement>[] = [];

  constructor() {
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

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    const target: HTMLDivElement | undefined = e.target.closest('.slider__scale-text')?.parentNode;
    if (target !== undefined) {
      this.emit('scaleValueSelect', {
        index: Number(target.dataset.index),
      });
    }
  }
}

export default ScaleView;
