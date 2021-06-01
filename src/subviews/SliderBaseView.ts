import EventEmitter from '../EventEmitter';

class SliderBaseView extends EventEmitter implements ISliderSubView {
  $thisElem = $('<div class="slider__base"></div>');
}

export default SliderBaseView;
