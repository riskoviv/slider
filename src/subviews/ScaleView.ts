import SubView from '../SubView';

class ScaleView extends SubView implements IScaleView {
  private allowedValues: number[] = [];

  private scaleValueElements: JQuery<HTMLDivElement>[] = [];

  private scaleResizeObserver: ResizeObserver | undefined;

  constructor() {
    super();
    this.bindClickListener();
  }

  updateScale(data: {
    allowedPositions: number[],
    allowedValues: number[],
    dimension: Dimension,
    axis: Axis,
  }): void {
    this.allowedValues = data.allowedValues;
    this.createScaleValuesElements(data)
      .insertScaleValueElements()
      .initResizeObserver(data.dimension, data.axis);
  }

  initResizeObserver(dimension: Dimension, axis: Axis): void {
    this.scaleResizeObserver = new ResizeObserver(() => {
      this.optimizeValuesCount(axis, dimension);
    });
    this.scaleResizeObserver.observe(this.$elem.get()[0]);
  }

  private createScaleValuesElements(data: {
    allowedPositions: number[],
    dimension: Dimension,
  }): ScaleView {
    const {
      allowedPositions, dimension,
    } = data;
    const scaleSize = this.$elem[dimension]() ?? 1;
    const quotient = Math.round((allowedPositions.length / scaleSize) * 3);
    const lastElemIndex = allowedPositions.length - 1;
    const isEveryValueAllowed = [0, 1].includes(quotient);
    this.scaleValueElements = [];

    if (isEveryValueAllowed) {
      this.scaleValueElements = allowedPositions.map((position, index) => (
        this.makeNewScaleValueElement(
          index,
          position,
        )
      ));
    } else {
      for (let index = 0; index <= lastElemIndex; index += quotient) {
        this.scaleValueElements.push(this.makeNewScaleValueElement(
          index,
          allowedPositions[index],
        ));
      }

      const lastElemIsNotMaxValue = this.scaleValueElements
        .slice(-1)[0]
        .data('index') !== lastElemIndex;
      if (lastElemIsNotMaxValue) {
        this.scaleValueElements.push(
          this.makeNewScaleValueElement(
            lastElemIndex,
            100,
          ),
        );
      }
    }

    return this;
  }

  private makeNewScaleValueElement = (
    index: number,
    position: number,
  ): JQuery<HTMLDivElement> => (
    $(`
      <div class="slider__scale-block" data-index="${index}" style="--scale-block-position: ${position}%">
        <span class="slider__scale-text">${this.allowedValues[index]}</span>
      </div>
    `)
  );

  private insertScaleValueElements(): ScaleView {
    this.$elem.empty();
    this.$elem.append(this.scaleValueElements);
    return this;
  }

  private optimizeValuesCount(axis: Axis, dimension: Dimension): void {
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
    if (target instanceof HTMLSpanElement) {
      this.emit('scaleValueSelect', Number(target.innerText));
    }
  }
}

export default ScaleView;
