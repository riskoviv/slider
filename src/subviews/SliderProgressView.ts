import IEventEmitter from '../EventEmitter';

class SliderProgressView extends IEventEmitter implements ISliderProgressView {
  $elem = $('<div class="slider__progress"></div>');

  private handlesPositions: number[];

  private size: number;

  private dimension: SliderDimension;

  private axis: SliderAxis;

  constructor(
    private isInterval: boolean,
    private isVertical: boolean,
  ) {
    super();
    if (this.isInterval) {
      this.$elem.addClass('slider__progress_interval');
    }

    this.dimension = this.isVertical ? 'height' : 'width';
    this.axis = this.isVertical ? 'top' : 'left';
    this.handlesPositions = [];
  }

  updateProgressSize(handleNumber: 1 | 2, handlePosition: number) {
    this.handlesPositions[handleNumber] = handlePosition;
    if (this.isInterval && this.handlesPositions[2] !== undefined) {
      this.applyProgressSize();
    } else if (!this.isInterval) {
      this.applyProgressSize();
    }
  }

  private applyProgressSize() {
    if (this.isInterval) {
      this.size = this.handlesPositions[2] - this.handlesPositions[1];
      this.$elem.css({
        [this.axis]: `${this.handlesPositions[1]}%`,
        [this.dimension]: `${this.size}%`,
      });
    } else {
      this.$elem.css({
        [this.axis]: 0,
        [this.dimension]: `${this.handlesPositions[1]}%`,
      });
    }
  }
}

export default SliderProgressView;
