/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import '@testing-library/jest-dom';
import ScaleView from './ScaleView';

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

  describe('optimizeValuesCount()', () => {
    test('should optimize count of elements that has visible span element containing corresponding value, i.e. hide scale-text elements that located less than 5 px away from scale-text element of adjacent scale value element', () => {
      // TODO: define dimensions through styles for scale element
      // TODO: add more value elements
      // TODO: check if there are elements w/ hidden numbers (__scale-text)
      expect(false).toBe(true);
    });
  });
});
