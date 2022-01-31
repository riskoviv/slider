import EventEmitter from '../EventEmitter';

class BaseView extends EventEmitter implements IBaseView {
  $elem = $('<div class="slider__base"></div>');
}

export default BaseView;
