import $ from 'jquery';
import EventEmitter from './EventEmitter';

// type SliderViewElements = {
//   [key: string]: JQuery<HTMLElement>;
// };

class SliderView extends EventEmitter {
  constructor(
    private pluginRootElem: JQuery<HTMLElement>,
  ) {
    super();
    this.pluginRootElem.html(this.innerElements);
    $('.js-slider-component', this.pluginRootElem)
      .on('click', this.emitSliderClicked);
  }

  private innerElements = `
      <div class="slider-component js-slider-component"></div>
      <div class="slider-component js-slider-component"></div>
      <div class="slider-component js-slider-component"></div>`;

  private emitSliderClicked = (event: JQuery.ClickEvent) => {
    this.emit('sliderElementClicked', event.target as HTMLDivElement);
  }

  changeSliderColor = (target: HTMLDivElement) => {
    $(target).toggleClass('slider-component_color_yellow');
  }
}

export default SliderView;
