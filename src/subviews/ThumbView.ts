import SubView from '../SubView';

class ThumbView extends SubView implements ISubView {
  constructor(elementNumber: 1 | 2 = 1) {
    super('thumb', elementNumber);
  }
}

export default ThumbView;
