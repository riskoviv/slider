import SubView from '../SubView';

class ThumbView extends SubView implements ISubView {
  constructor(protected readonly elementNumber: 1 | 2 = 1) {
    super(elementNumber);
  }
}

export default ThumbView;
