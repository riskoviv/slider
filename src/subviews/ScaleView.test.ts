/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import '@testing-library/jest-dom';
import ScaleView from './ScaleView';

const makeNewScaleValueElement = (value: number): JQuery<HTMLDivElement> => (
  $(`<div class="slider__scale-block">
    <span class="slider__scale-text">${value}</span>
  </div>`)
);
const unnumberedClass = 'slider__scale-block_unnumbered';
const getScaleElementsWithValues = (valuesArray: number[]) => (
  valuesArray.map(
    (value) => makeNewScaleValueElement(value),
  )
);

describe('ScaleView', () => {
  let scale: ScaleView;
  let scaleElement: HTMLDivElement;

  beforeAll(() => {
    scale = new ScaleView();
    [scaleElement] = scale.$elem.get();
  });

  test('constructor should create instance of ScaleView that has $elem property that is $DIV element w/ class slider__scale', () => {
    expect(scale).toBeInstanceOf(ScaleView);
    expect(scale).toHaveProperty('$elem');
    expect(scale.$elem.get(0)?.tagName).toBe('DIV');
    expect(scale.$elem.get(0)?.className).toBe('slider__scale');
  });

  test('should contain property scaleValueElements that contains empty array', () => {
    expect(scale).toHaveProperty('scaleValueElements');
    expect(scale.scaleValueElements).toEqual([]);
  });

  describe('insertScaleValueElements()', () => {
    test('if scaleValueElements array is empty, should empty scale.$elem and append nothing to it', () => {
      scale.insertScaleValueElements();

      expect(scale.$elem.children().length).toBe(0);
    });

    test('if scaleValueElements array contains $DIV elements, method should append these elements to slider.$elem', () => {
      const $scaleValueElement1: JQuery<HTMLDivElement> = $(`<div class="slider__scale-block" style="--scale-block-position: 0%">
          <span class="slider__scale-text">0</span>
        </div>`);
      const $scaleValueElement2: JQuery<HTMLDivElement> = $(`<div class="slider__scale-block" style="--scale-block-position: 10%">
          <span class="slider__scale-text">10</span>
        </div>`);
      scale.scaleValueElements = [$scaleValueElement1, $scaleValueElement2];
      const scaleValueElement1 = $scaleValueElement1.get()[0];
      const scaleValueElement2 = $scaleValueElement2.get()[0];

      scale.insertScaleValueElements();

      expect(scale.$elem.children().length).toBe(2);
      expect(scaleElement).toContainElement(scaleValueElement1);
      expect(scaleElement).toContainElement(scaleValueElement2);
    });
  });

  describe('optimizeValuesCount() should add unnumberedClass to scale-block elements that located less than 5px away from adjacent scale-block element', () => {
    describe('in horizontal state (isVertical: false)', () => {
      test.each([
        {
          values: [0, 100, 200, 300, 400, 500],
          positionsAndSizes: [
            [0, 6.8], [20, 20.6], [40, 20.6], [60, 20.6], [80, 20.6], [100, 20.6],
          ],
          visibilityStates: [false, false, true, false, true, false],
        },
      ])(
        'if scale width is 120px, should make values invisible as in array: $visibilityStates',
        ({ values, positionsAndSizes, visibilityStates }) => {
          scale.scaleValueElements = getScaleElementsWithValues(values);
          positionsAndSizes.forEach(
            ([position, size], index) => {
              jest.spyOn(scale.scaleValueElements[index], 'position')
                .mockReturnValue({ left: position, top: 0 });
              jest.spyOn(scale.scaleValueElements[index], 'width')
                .mockReturnValue(size);
            },
          );
          scale.insertScaleValueElements();
          scale.optimizeValuesCount('left', 'width');

          visibilityStates.forEach((state, i) => {
            expect(scale.scaleValueElements[i].hasClass(unnumberedClass)).toBe(state);
          });
        },
      );
    });

    describe('in vertical state (isVertical: true)', () => {
      test.each([
        {
          values: [0, 100, 200, 300, 400, 500],
          positions: [0, 20, 40, 60, 80, 100],
          visibilityStates: [false, true, false, true, true, false],
        },
      ])(
        'if scale height is 110px, should make values invisible as in array: $visibilityStates',
        ({ values, positions, visibilityStates }) => {
          scale.scaleValueElements = getScaleElementsWithValues(values);
          positions.forEach(
            (position, index) => {
              jest.spyOn(scale.scaleValueElements[index], 'position')
                .mockReturnValue({ left: 0, top: position });
              jest.spyOn(scale.scaleValueElements[index], 'height')
                .mockReturnValue(18);
            },
          );
          scale.insertScaleValueElements();
          scale.optimizeValuesCount('top', 'height');

          visibilityStates.forEach((state, i) => {
            expect(scale.scaleValueElements[i].hasClass(unnumberedClass)).toBe(state);
          });
        },
      );
    });
  });

  describe('pointerdown event', () => {
    let scaleValueSelectSpy: jest.Mock;

    beforeAll(() => {
      scaleValueSelectSpy = jest.fn();
      scale.on('scaleValueSelect', scaleValueSelectSpy);
      scale.scaleValueElements = getScaleElementsWithValues([0, 100, 200, 300, 400, 500]);
      scale.insertScaleValueElements();
    });

    test('if e.button === 0 (LMB) & e.target is span (.slider__scale-text) element, should emit scaleValueSelect event with value of that element as argument (100)', () => {
      const scaleTextElement = scaleElement.querySelector('.slider__scale-block:nth-child(2) > .slider__scale-text');
      const pointerDownEvent = new MouseEvent('pointerdown', { button: 0 });
      Object.defineProperty(pointerDownEvent, 'target', {
        value: scaleTextElement,
      });

      scaleElement.dispatchEvent(pointerDownEvent);

      expect(scaleValueSelectSpy).toBeCalledWith(100);
    });

    test('if e.target is not span.slider__scale-text element, should not emit scaleValueSelect event', () => {
      const pointerDownEvent = new MouseEvent('pointerdown', { button: 0 });

      scaleElement.dispatchEvent(pointerDownEvent);

      expect(scaleValueSelectSpy).not.toBeCalled();
    });
  });
});
