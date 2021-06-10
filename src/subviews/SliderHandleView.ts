import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  private thisElem: HTMLElement;

  private shiftX: number;

  private sliderRightBound: number;

  constructor(private sliderDirectContainer: HTMLElement, private bounds: HandleBounds) {
    super();

    this.$elem.on('mousedown', this.handleMouseDown)
      .on('contextmenu', this.handle1PreventContextMenu);

    [this.thisElem] = this.$elem.get();

    this.sliderRightBound = this.sliderDirectContainer.offsetWidth;
  }

  setHandlePosition(left: number) {
    this.$elem.css('left', `${this.keepHandleInBounds(left)}px`);
  }

  handleMouseDown = (e: JQuery.MouseDownEvent) => {
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

  keepHandleInBounds(leftValue: number) {
    if (leftValue < 0) return 0;
    if (leftValue > this.sliderRightBound) return this.sliderRightBound;
    return leftValue;
  }

  handleMouseMove = (e: JQuery.MouseMoveEvent) => {
    let newLeft = e.pageX
      - this.sliderDirectContainer.offsetLeft
      - this.shiftX;

    newLeft = this.keepHandleInBounds(newLeft);

    this.setHandlePosition(newLeft);

    const leftInPercents = newLeft / this.sliderRightBound;

    this.emit('handleMoved', leftInPercents);
  }

  handleMouseUp = (e: JQuery.MouseUpEvent) => {
    if (e.originalEvent.button !== 0) {
      e.preventDefault();
    }

    this.emit('handleMouseUp');

    $(document).off('mousemove', this.handleMouseMove)
      .off('mouseup', this.handleMouseUp);
  }

  handle1PreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
