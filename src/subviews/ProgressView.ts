import SubView from '../SubView';

  $elem = $('<div class="slider__progress"></div>');

  private handlesPositions: number[];

  private size: number = 0;

  constructor(
    private isInterval: boolean,
  ) {
    super();
    this.handlesPositions = [];
  }

  /**
   * NEW function than will change position & size
   * calculations, based fully on css variables
   * @param isInterval is there the handle2?
   */
  toggleInterval(isInterval: boolean) {
    if (isInterval) {
      this.$elem.css({
        '--progress-position': 'var(--handle-1-position)',
        '--progress-length': 'calc(var(--handle-2-position) - var(--handle-1-position))',
      });
    } else {
      this.$elem.css({
        '--progress-position': '0%',
        '--progress-size': 'var(--handle-1-position)',
      });
    }
  }

  /**
   * OLD FUNCTIONS
   */
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
class ProgressView extends SubView {
}

export default ProgressView;
