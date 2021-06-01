import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderSubView {
  $thisElem = $('<div class="slider__handle"></div>');

  constructor() {
    super();

      .on('mouseup', this.emitHandle1MouseUp)
      .on('mousemove', this.emitHandle1MouseMove);
    this.$thisElem.on('mousedown', this.handle1MouseDown)
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
}

export default SliderHandleView;
