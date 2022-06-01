import SubView from '../SubView';

class ScaleView extends SubView implements IScaleView {
  scaleValueElements: JQuery<HTMLDivElement>[] = [];

  constructor() {
    super('scale');
    this.bindClickListener();
  }

  insertScaleValueElements(): void {
    this.$elem.empty();
    this.$elem.append(this.scaleValueElements);
  }

  optimizeValuesCount(axis: Axis, dimension: Dimension): void {
    const [$firstElem] = this.scaleValueElements;
    const [$lastElem] = this.scaleValueElements.slice(-1);
    let $currentElem = $firstElem;
    let curElemPosition = $currentElem.position()[axis];
    let curElemEdgeBound = this.getElementEdgeBound($currentElem, curElemPosition, dimension);

    this.scaleValueElements.slice(1).forEach(($elem) => {
      const elemPosition = $elem.position()[axis];
      if (elemPosition - 5 <= curElemEdgeBound) {
        if ($elem === $lastElem && $currentElem !== $firstElem) {
          $currentElem.addClass('slider__scale-block_unnumbered');
        } else if ($elem !== $lastElem) {
          $elem.addClass('slider__scale-block_unnumbered');
        }
      } else {
        $currentElem = $elem;
        curElemPosition = elemPosition;
        curElemEdgeBound = this.getElementEdgeBound($elem, elemPosition, dimension);
        $elem.removeClass('slider__scale-block_unnumbered');
      }
    });
  }

  private getElementEdgeBound = (
    element: JQuery<HTMLSpanElement>,
    position: number,
    dimension: Dimension,
  ) => position + (element[dimension]() ?? 1);

  private bindClickListener() {
    this.$elem.get()[0].addEventListener('pointerdown', this.scaleValueClick);
  }

  private scaleValueClick = (e: PointerEvent): void => {
    const { target } = e;
    if (target instanceof HTMLSpanElement && e.button === 0) {
      this.emit('scaleValueSelect', Number(target.innerText));
    }
  }
}

export default ScaleView;
