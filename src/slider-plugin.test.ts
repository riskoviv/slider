/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import './slider-plugin';

window.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const countOfChildrenInContainer = (container: JQuery, children: string[]) => (
  children.reduce((childCount, childClass) => (
    childCount + container.find(`.slider__${childClass}`).length
  ), 0)
);

describe('slider-plugin', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  let $sliderInstance: JQuery<HTMLElement>;

  describe('if called w/o options', () => {
    beforeAll(() => {
      $sliderInstance = $sliderContainer.sliderPlugin();
    });

    test('should create default instance of slider plugin', () => {
      expect($sliderContainer.children().length).toBe(1);
      expect($sliderContainer.children().first().hasClass('slider')).toBe(true);
      ['setStepSize', 'setValue', 'setVerticalState', 'setInterval', 'setShowProgress']
        .forEach((methodName) => {
          expect($sliderInstance).toHaveProperty(methodName);
        });
      expect($sliderInstance.hasClass('slider')).toBe(true);
    });

    test('should have controlContainer element that has 2 subViews', () => {
      const $controlContainer = $('.slider__control-container', $sliderInstance);
      const childClasses = ['track', 'thumb'];
      expect(countOfChildrenInContainer($controlContainer, childClasses))
        .toBe(childClasses.length);
    });
  });

  describe('if called w/ custom state options that creates all possible subViews', () => {
    let $scaleElem: JQuery;

    beforeAll(() => {
      const sliderContainerElem = $sliderContainer.get()[0];
      Object.defineProperty(sliderContainerElem, 'offsetWidth', { value: 700 });
      $sliderInstance = $sliderContainer.sliderPlugin({
        isInterval: true,
        showTip: true,
        showScale: true,
        showProgressBar: true,
      });
      $scaleElem = $sliderInstance.find('.slider__scale');
    });

    test('slider should have all needed elements', () => {
      const childElements = ['control-container', 'track', 'thumb_1', 'thumb_2', 'tip_1', 'tip_2', 'scale'];
      expect(countOfChildrenInContainer($sliderInstance, childElements))
        .toBe(childElements.length);
      expect($scaleElem.children().length).toBe(21);
    });

    test('scale elements should have these style values and be at 0 position', () => {
      $scaleElem.children().each((idx, sliderElem) => {
        expect(sliderElem.style.getPropertyValue('--scale-block-position'))
          .toBe(`${idx * 5}%`);
        expect(sliderElem.textContent?.trim()).toBe(String(-100 + (10 * idx)));
        expect(sliderElem.offsetLeft).toBe(0);
        expect($(sliderElem).width()).toBe(0);
        expect($(sliderElem).position().left).toBe(0);
      });
    });
  });
});
