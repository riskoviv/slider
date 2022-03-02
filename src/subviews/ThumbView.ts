import SubView from '../SubView';

class ThumbView extends SubView implements IThumbView {
  constructor(protected readonly elementNumber: 1 | 2) {
    super();
  }

  setThumbThickness(thickness: number): void {
    this.$elem.css(
      '--thumb-thickness',
      `${thickness}%`,
    );
  }
}

export default ThumbView;
