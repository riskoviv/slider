import $ from 'jquery';

import EventEmitter from './EventEmitter';

type SliderViewOptions = {
  isVertical?: boolean,
  isInterval?: boolean,
  showProgressBar?: boolean,
};

class View extends EventEmitter implements IView {
  readonly $elem: JQuery;

  readonly $controlContainer: JQuery<HTMLDivElement> = $(
    '<div class="slider__control-container"></div>',
  );

  readonly controlContainerElem: HTMLDivElement;

  constructor(options: SliderViewOptions = {}) {
    super();
    this.$elem = this.render(options);
    [this.controlContainerElem] = this.$controlContainer;
    this.bindEventListeners();
  }

  toggleVertical(isVertical: boolean): void {
    this.$elem.toggleClass('slider_vertical', isVertical);
  }

  toggleInterval(isInterval: boolean): void {
    this.$elem.toggleClass('slider_interval', isInterval);
  }

  toggleProgressBar(showProgress: boolean): void {
    this.$elem.toggleClass('slider_show-progress', showProgress);
  }

  setPosition(valueNumber: 1 | 2, position: number): void {
    this.$controlContainer.css(`--value-${valueNumber}-position`, `${position}%`);
  }

  setThumbThickness(thickness: number): void {
    this.$controlContainer.css(
      '--thumb-thickness',
      `${thickness}%`,
    );
  }

  private render(options: SliderViewOptions): JQuery {
    const {
      isVertical = false,
      isInterval = false,
      showProgressBar = false,
    } = options;
    const sliderModifiers = [
      isVertical ? 'slider_vertical' : '',
      isInterval ? 'slider_interval' : '',
      showProgressBar ? 'slider_show-progress' : '',
    ];
    const sliderClassName = ['slider', ...sliderModifiers].join(' ').trim();
    const $sliderElem = $(`<div class="${sliderClassName}"></div>`).append(this.$controlContainer);
    return $sliderElem;
  }

  private bindEventListeners() {
    this.controlContainerElem.addEventListener('pointerdown', this.pointerDown);
    this.$controlContainer.on('contextmenu.controlContainer', View.preventContextMenu);
  }

  private pointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();
    this.controlContainerElem.setPointerCapture(e.pointerId);

    const { target, offsetX, offsetY } = e;
    if (target instanceof HTMLDivElement) {
      this.emit({
        event: 'sliderPointerDown',
        value: { target, offsetX, offsetY },
      });
    }
  };

  private static preventContextMenu = () => false;
}

export default View;
