import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  private thisElem: HTMLElement;

  private shiftX: number;

  private sliderRightBound: number;

  private allowedValues: number[];

  constructor(private sliderDirectContainer: HTMLElement, private bounds: HandleBounds) {
    super();

    this.$elem.on('mousedown', this.handleMouseDown)
      .on('contextmenu', this.handle1PreventContextMenu);

    [this.thisElem] = this.$elem.get();

    this.sliderRightBound = this.sliderDirectContainer.offsetWidth;

    this.createAllowedValuesArr();
  }

  private createAllowedValuesArr() {
    const totalSliderRange = Math.abs(this.bounds.maxValue) + Math.abs(this.bounds.minValue);
    const stepSizeInPercents = (this.bounds.stepSize / totalSliderRange) * 100;
    this.allowedValues = [];

    for (let i = 0; i <= 100; i += stepSizeInPercents) {
      this.allowedValues.push(Math.round(this.sliderRightBound * (i / 100)));
    }
    if (this.allowedValues[this.allowedValues.length - 1] !== this.sliderRightBound) {
      this.allowedValues.push(this.sliderRightBound);
    }
  }

  setPosition(left: number): boolean {
    this.$elem.css('left', `${this.keepHandleInBounds(left)}px`);
    if (this.allowedValues.includes(left)) {
      return true;
    }
    return false;
  }

  private handleMouseDown = (e: JQuery.MouseDownEvent) => {
    if (e.originalEvent.button !== 0) {
      return;
    }

    e.preventDefault();

    this.shiftX = e.clientX
      - this.thisElem.getBoundingClientRect().left
      - this.thisElem.offsetWidth / 2;

    $(document).on('mousemove', this.handleMouseMove)
      .on('mouseup', this.handleMouseUp);
  }

  private keepHandleInBounds(leftValue: number) {
    if (leftValue < 0) return 0;
    if (leftValue > this.sliderRightBound) return this.sliderRightBound;
    return leftValue;
  }

  private handleMouseMove = (e: JQuery.MouseMoveEvent) => {
    let newLeft = e.pageX
      - this.sliderDirectContainer.offsetLeft
      - this.shiftX;

    newLeft = this.keepHandleInBounds(newLeft);
    const isValueSet = this.setPosition(newLeft);

    this.emit('handleMoved', this.keepHandleInBounds(newLeft) + 15);

    if (isValueSet) {
      const leftInPercents = newLeft / this.sliderRightBound;
      this.emit('handleValueSet', leftInPercents);
    }
  }

  private handleMouseUp = (e: JQuery.MouseUpEvent) => {
    if (e.originalEvent.button !== 0) {
      e.preventDefault();
    }

    this.emit('handleStopped');

    $(document).off('mousemove', this.handleMouseMove)
      .off('mouseup', this.handleMouseUp);
  }

  private handle1PreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
