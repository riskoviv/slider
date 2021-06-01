import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderSubView {
  $thisElem = $('<div class="slider__handle"></div>');

  private thisElem: HTMLElement;

  private shiftX: number;

  constructor(private sliderDirectContainer: HTMLElement) {
    super();

    this.$thisElem.on('mousedown', this.handle1MouseDown)
      .on('contextmenu', this.handle1PreventContextMenu);

    [this.thisElem] = this.$thisElem.get();
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
    const sliderRightBound = this.sliderDirectContainer.offsetWidth; // правая граница
    if (newLeft > sliderRightBound) newLeft = sliderRightBound; // ограничение справа

    this.$thisElem.css('left', `${newLeft}px`);

    this.emit('handle1MouseMove', newLeft);
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
