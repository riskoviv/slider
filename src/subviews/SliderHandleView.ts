import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderSubView {
  $thisElem = $('<div class="slider__handle"></div>');

  constructor(private sliderDirectContainer: HTMLElement) {
    super();

      .on('mousemove', this.emitHandle1MouseMove);
    this.$thisElem.on('mousedown', this.handle1MouseDown)
      .on('contextmenu', this.handle1PreventContextMenu);
  }

  handle1MouseDown = (e: JQuery.MouseDownEvent) => {
    if (e.originalEvent.button !== 0) {
      return;
    }
    e.preventDefault();
      .on('mouseup', this.handle1MouseUp);
  }

    this.emit('handle1MouseMove', this);
  handle1MouseMove = (e: JQuery.MouseMoveEvent) => {
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
