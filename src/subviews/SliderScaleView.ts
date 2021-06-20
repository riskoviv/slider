import EventEmitter from '../EventEmitter';

class SliderScaleView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__scale"></div>');

  constructor(public allowedValues: number[], private allowedRealValues: number[]) {
    super();

    this.allowedValues.forEach((value, index) => {
      this.$elem.append($(`
        <span class="slider__scale-value" data-index="${index}" style="left: ${value}%">
          ${this.allowedRealValues[index]}
        </span>
      `));
    });

    this.$elem.on('click', this.scaleValueClick);
  }

  scaleValueClick = (e: JQuery.ClickEvent) => {
    if (e.target.classList.contains('slider__scale-value')) {
      this.emit('scaleValueSelect', this.allowedValues[e.target.dataset.index]);
    }
  }
}

export default SliderScaleView;
