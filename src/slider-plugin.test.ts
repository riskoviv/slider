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
    test('slider should have all needed elements', () => {
      const sliderContainerElem = $sliderContainer.get()[0];
      // const observer = new MutationObserver((mutations) => {
      //   mutations.forEach((mutation) => {
      //     if (mutation.type === 'childList') {
      //       console.log('mutated childList', ...mutation.addedNodes);

      //       [...mutation.addedNodes].forEach((node) => {
      //         if (node instanceof HTMLDivElement && node.className === 'slider__scale') {
      //           Object.defineProperty(node, 'offsetWidth', { value: 600 });
      //           console.log('mutated scale!');
      //         }
      //       });
      //     }
      //   });
      // });
      // observer.observe(sliderContainerElem, { childList: true, subtree: true });
      const styleElem = document.createElement('style');
      styleElem.innerHTML = '.slider-scale { width: 600px; }';
      document.head.append(styleElem);
      document.body.append(sliderContainerElem);
      $sliderInstance = $sliderContainer.sliderPlugin({
        isInterval: true,
        showTip: true,
        showScale: true,
        showProgressBar: true,
      });

      const childElements = ['control-container', 'track', 'thumb_1', 'thumb_2', 'tip_1', 'tip_2', 'scale'];
      expect(countOfChildrenInContainer($sliderInstance, childElements))
        .toBe(childElements.length);
      expect($sliderInstance.find('.slider__scale').children().length).toBe(21);
      // expect($sliderInstance.find('.slider__scale').get()[0].offsetWidth).toBe(600);
    });
  });
});
