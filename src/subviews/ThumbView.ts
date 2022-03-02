import SubView from '../SubView';

class ThumbView extends SubView {
  private readonly elem = this.$elem.get()[0];

  constructor(protected readonly elementNumber: 1 | 2) {
    super();
    this.$elem.css(
      '--thumb-thickness',
      `${this.params.stepSizeInPercents}%`,
    );
  }
  }

    );
  }
}

export default ThumbView;
