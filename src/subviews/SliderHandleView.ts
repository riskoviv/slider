import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  private thisElem: HTMLElement;

  private shiftX: number;

  private sliderRightBound: number;

  constructor(private sliderDirectContainer: HTMLElement) {
    super();

    this.$elem.on('mousedown', this.handle1MouseDown)
      .on('contextmenu', this.handle1PreventContextMenu);

    [this.thisElem] = this.$elem.get();

    this.sliderRightBound = this.sliderDirectContainer.offsetWidth;
  }

  setHandlePosition(left: number) {
    this.$elem.css('left', `${this.keepHandleInBounds(left)}px`);
  }

  handle1MouseDown = (e: JQuery.MouseDownEvent) => {
    if (e.originalEvent.button !== 0) {
      return;
    }

    e.preventDefault();

    this.shiftX = e.clientX
      - this.thisElem.getBoundingClientRect().left
      - this.thisElem.offsetWidth / 2;

    $(document).on('mousemove', this.handle1MouseMove)
      .on('mouseup', this.handle1MouseUp);
  }

  handle1MouseMove = (e: JQuery.MouseMoveEvent) => {
    let newLeft = e.pageX
      - this.sliderDirectContainer.offsetLeft
      - this.shiftX;
    // newLeft = Math.floor(newLeft / 50) * 50;
    if (newLeft < 0) newLeft = 0; // ограничение с левой стороны
    if (newLeft > sliderRightBound) newLeft = sliderRightBound; // ограничение справа

    this.setHandlePosition(newLeft);

    const leftInPercents = newLeft / this.sliderRightBound;

    this.emit('handle1MouseMove', leftInPercents);
  }

  handle1MouseUp = (e: JQuery.MouseUpEvent) => {
    if (e.originalEvent.button !== 0) {
      e.preventDefault();
    }
    $(document).off('mousemove', this.handle1MouseMove)
      .off('mouseup', this.handle1MouseUp);
  }

  handle1PreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
