import View from '../View';

class SliderView extends View {
  readonly $elem: JQuery<HTMLDivElement> = $('<div class="slider"></div>');

  readonly $controlContainer: JQuery<HTMLDivElement> = $('<div class="slider__control-container"></div>');

  protected render = (): JQuery<HTMLDivElement> => (
    $('<div class="slider"></div>')
  );

  setPosition(position: number): void {
    this.$elem.css(`--${this.viewType}-position`, `${position}%`);
  }
}

export default SliderView;
