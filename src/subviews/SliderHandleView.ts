import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderSubView {
  HTML = '<div class="slider__handle"></div>';
}

export default SliderHandleView;
