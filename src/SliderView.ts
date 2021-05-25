import $ from 'jquery';
import EventEmitter from './EventEmitter';

// type SliderViewElements = {
//   [key: string]: JQuery<HTMLElement>;
// };

class SliderView extends EventEmitter {
  pluginOptions: {};

  constructor(private pluginRootElem: JQuery<HTMLElement>) {
    super();
    this.emit('viewInit');
    this.pluginRootElem.html(this.createInnerElements());
    $('.js-slider-component', this.pluginRootElem)
      .on('click', this.emitSliderClicked);
  }

  private createInnerElements = () => `
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
