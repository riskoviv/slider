type SliderViewOptions = {
  isVertical: boolean,
  isInterval: boolean,
};

class View implements IView {
  readonly $elem: JQuery<HTMLElement>;

  readonly $controlContainer: JQuery<HTMLDivElement> = $('<div class="slider__control-container"></div>');

  constructor(options?: SliderViewOptions) {
    this.$elem = this.render(options);
  }

  protected render(
    options: SliderViewOptions = { isVertical: false, isInterval: false },
  ): JQuery<HTMLElement> {
    return $(`<div class="slider${
      options.isVertical ? ' slider_vertical' : ''
    }${
      options.isInterval ? ' slider_interval' : ''
    }"></div>`).append(this.$controlContainer);
  }

  toggleVertical(isVertical: boolean): void {
    this.$elem.toggleClass('slider_vertical', isVertical);
  }

  toggleInterval(): void {
    this.$elem.toggleClass('slider_interval');
  }

  setPosition(valueNumber: 1 | 2, position: number): void {
    this.$elem.css(`--value-${valueNumber}-position`, `${position}%`);
  }
}

export default View;
