import IEventEmitter from '../EventEmitter';

class ProgressView extends IEventEmitter implements IProgressView {
  $elem = $('<div class="slider__progress"></div>');

  private handlesPositions: number[];

  private size: number = 0;

  constructor(
    private isInterval: boolean,
  ) {
    super();
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
        '--progress-position': `${this.handlesPositions[1]}%`,
        '--progress-length': `${this.size}%`,
      });
    } else {
      this.$elem.css({
        '--progress-position': 0,
        '--progress-length': `${this.handlesPositions[1]}%`,
      });
    }
  }
}

export default ProgressView;
