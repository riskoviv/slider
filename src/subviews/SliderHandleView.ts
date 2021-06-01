import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderSubView {
  HTML = $('<div class="slider__handle"></div>');

  constructor() {
    super();

    this.HTML.on('mousedown', this.emitHandle1MouseDown)
      .on('mouseup', this.emitHandle1MouseUp)
      .on('mousemove', this.emitHandle1MouseMove);
  }

  emitHandle1MouseDown = (e: JQuery.MouseDownEvent) => {
    if (e.originalEvent.button !== 0) {
      return;
    }
    e.preventDefault();
  }

  emitHandle1MouseMove = (e: JQuery.MouseMoveEvent) => {
    this.emit('handle1MouseMove', this);
  }

  emitHandle1MouseUp = (e: JQuery.MouseUpEvent) => {
  }
}

export default SliderHandleView;
