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

  optimizeValuesCount(positionAxis: PositionAxis, sizeDimension: SizeDimension): void {
    const [$firstElem] = this.scaleValueElements;
    const [$lastElem] = this.scaleValueElements.slice(-1);
    let $currentElem = $firstElem;
    let curElemPosition = $currentElem.position()[positionAxis];
    let curElemEdgeBound = ScaleView.getElementEdgeBound(
      $currentElem,
      curElemPosition,
      sizeDimension,
    );

    this.scaleValueElements.slice(1).forEach(($elem) => {
      const elemPosition = $elem.position()[positionAxis];
      if (elemPosition - 5 <= curElemEdgeBound) {
        const isLastElemAndOverlappingIsNotFirstElem = $elem === $lastElem
          && $currentElem !== $firstElem;
        if (isLastElemAndOverlappingIsNotFirstElem) {
          $currentElem.addClass('slider__scale-block_unnumbered');
        } else if ($elem !== $lastElem) {
          $elem.addClass('slider__scale-block_unnumbered');
        }
      } else {
        $currentElem = $elem;
        curElemPosition = elemPosition;
        curElemEdgeBound = ScaleView.getElementEdgeBound($elem, elemPosition, sizeDimension);
        $elem.removeClass('slider__scale-block_unnumbered');
      }
    });
  }

  private static getElementEdgeBound(
    element: JQuery<HTMLSpanElement>,
    position: number,
    sizeDimension: SizeDimension,
  ): number {
    return position + (element[0][sizeDimension]);
  }

  private bindClickListener() {
    this.$elem[0].addEventListener('pointerdown', this.scaleValueClick);
  }

  private scaleValueClick = (e: PointerEvent): void => {
    const { target } = e;
    const scaleValueIsClickedByMainPointerButton = target instanceof HTMLSpanElement
      && e.button === 0;
    if (scaleValueIsClickedByMainPointerButton) {
      this.emit({
        event: 'scaleValueSelect',
        value: Number(target.textContent),
      });
    }
  };
}

export default ScaleView;
