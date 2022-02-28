import SubView from '../SubView';

class ScaleView extends SubView {
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

  insertValueElements(valueElements: JQuery<HTMLDivElement>[]): void {
    this.$elem.append(valueElements);
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
