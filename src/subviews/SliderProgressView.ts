import IEventEmitter from '../EventEmitter';

class SliderProgressView extends IEventEmitter implements ISliderProgressView {
  $elem = $('<div class="slider__progress"></div>');

  private handlesPositions: number[];

  private size: number;

  private dimension: SliderDimension;

  private topOrLeft: SliderAxis;

  constructor(
    private isInterval: boolean,
    private isVertical: boolean,
  ) {
    super();
    this.dimension = this.isVertical ? 'height' : 'width';
    this.topOrLeft = this.isVertical ? 'top' : 'left';
    this.handlesPositions = [];
  }

  updateProgressSize(handleNumber: 1 | 2, handlePosition: number) {
    this.handlesPositions[handleNumber - 1] = handlePosition;
    if (this.isInterval && this.handlesPositions[1] !== undefined) {
      this.applyProgressSize();
    } else if (!this.isInterval) {
      this.applyProgressSize();
    }
  }

  private applyProgressSize() {
    if (this.isInterval) {
      this.size = this.handlesPositions[1] - this.handlesPositions[0];
      this.$elem.css({
        [this.topOrLeft]: `${this.handlesPositions[0]}%`,
        [this.dimension]: `${this.size}%`,
      });
    } else {
      this.$elem.css({
        [this.topOrLeft]: 0,
        [this.dimension]: `${this.handlesPositions[0]}%`,
      });
    }
  }
}

export default SliderProgressView;
