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
  }

    this.emit('handle1MouseMove', this);
  handle1MouseMove = (e: JQuery.MouseMoveEvent) => {
  }

  handle1MouseUp = (e: JQuery.MouseUpEvent) => {
  }

  handle1PreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
