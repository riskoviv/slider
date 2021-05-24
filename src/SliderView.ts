import $ from 'jquery';
import EventEmitter from './EventEmitter';

// type SliderViewElements = {
//   [key: string]: JQuery<HTMLElement>;
// };

class SliderView extends EventEmitter {
  constructor() {
    super();
    $('#slider').html(SliderView.createInnerElements());
    $('.js-slider-component').on('click', this.emitSliderClicked);
  }

  private static createInnerElements(): string {
    return `
      <div class="slider-component js-slider-component" id="component-1"></div>
      <div class="slider-component js-slider-component" id="component-2"></div>
      <div class="slider-component js-slider-component" id="component-3"></div>`;
  }

  private emitSliderClicked = (event: JQuery.ClickEvent) => {
    this.emit('firstSliderClicked', event.target as HTMLDivElement);
  }

  static changeSliderColor(target: HTMLDivElement) {
    $(target).toggleClass('slider-component_color_yellow');
  }
}

export default SliderView;
