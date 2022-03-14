import SubView from '../SubView';

class ScaleView extends SubView implements IScaleView {
  private scaleValueElements: JQuery<HTMLDivElement>[] = [];

  private scaleResizeObserver: ResizeObserver | undefined;

  constructor() {
    super();
    this.$elem.on('click', this.scaleValueClick);
  }

  updateScale(data: {
    allowedPositions: number[],
    allowedValues: number[],
    dimension: Dimension,
    axis: Axis,
  }): void {
    const { dimension, axis } = data;
    this.createScaleValuesElements(data)
      .insertScaleValueElements()
      .optimizeValuesCount(axis, dimension);
    this.initResizeObserver(dimension, axis);
  }

  initResizeObserver(dimension: Dimension, axis: Axis): void {
    this.scaleResizeObserver = new ResizeObserver(() => {
      this.optimizeValuesCount(axis, dimension);
    });
    this.scaleResizeObserver.observe(this.$elem.get()[0]);
  }

  private createScaleValuesElements(data: {
    allowedPositions: number[],
    allowedValues: number[],
    dimension: Dimension,
    axis: Axis,
  }): ScaleView {
    const {
      allowedPositions, allowedValues, dimension,
    } = data;
    const scaleSize = this.$elem[dimension]() ?? 1;
    const quotient = Math.round((allowedPositions.length / scaleSize) * 3);
    const lastElemIndex = allowedPositions.length - 1;
    const isEveryValueAllowed = [0, 1].includes(quotient);
    this.scaleValueElements = [];

    if (isEveryValueAllowed) {
      this.scaleValueElements = allowedPositions.map((value, index) => (
        this.makeNewScaleValueElement(
          allowedValues,
          index,
          value,
        )
      ));
    } else {
      for (let index = 0; index <= lastElemIndex; index += quotient) {
        this.scaleValueElements.push(this.makeNewScaleValueElement(
          allowedValues,
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
            allowedValues,
            lastElemIndex,
            100,
          ),
        );
      }
    }

    return this;
  }

  private optimizeValuesCount(axis: Axis, dimension: Dimension): void {
    const $firstElem = this.scaleValueElements[0];
    const $lastElem = this.scaleValueElements.slice(-1)[0];
    let $currentElem = $firstElem;
    let curElemEdgeBound = this.getElementEdgeBound($currentElem, axis, dimension);

    this.scaleValueElements.slice(1).forEach(($elem) => {
      if ($elem.position()[axis] - 5 <= curElemEdgeBound) {
        if ($elem === $lastElem && $currentElem !== $firstElem) {
          $currentElem.addClass('slider__scale-block_unnumbered');
        } else if ($elem !== $lastElem) {
          $elem.addClass('slider__scale-block_unnumbered');
        }
      } else {
        $currentElem = $elem;
        curElemEdgeBound = this.getElementEdgeBound($currentElem, axis, dimension);
        $elem.removeClass('slider__scale-block_unnumbered');
      }
    });
  }

  private insertScaleValueElements(): ScaleView {
    this.$elem.empty();
    this.$elem.append(this.scaleValueElements);
    return this;
  }

  private makeNewScaleValueElement = (
    allowedValues: number[],
    index: number,
    position: number,
  ): JQuery<HTMLDivElement> => (
    $(`
      <div class="slider__scale-block" data-index="${index}" style="--scale-block-position: ${position}%">
        <span class="slider__scale-text">${allowedValues[index]}</span>
      </div>
    `)
  );

  private getElementEdgeBound = (
    element: JQuery<HTMLSpanElement>,
    axis: Axis,
    dimension: Dimension,
  ) => element.position()[axis] + (element[dimension]() ?? 1);

  private scaleValueClick = (e: JQuery.ClickEvent) => {
    const target: HTMLDivElement | undefined = e.target.closest('.slider__scale-text')?.parentNode;
    if (target !== undefined) {
      this.emit('scaleValueSelect', {
        index: Number(target.dataset.index),
      });
    }
  }
}

export default ScaleView;
