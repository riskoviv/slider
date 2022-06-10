/**
 * @jest-environment jsdom
 */
/* eslint-disable fsd/no-function-declaration-in-event-listener */
import $ from 'jquery';
import '../slider-plugin';
import { getTypedKeys } from '../utils';

window.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const defaultOptions: IPluginOptions = {
  stepSize: 10,
  minValue: -100,
  maxValue: 100,
  value1: -50,
  value2: 50,
  isVertical: false,
  isInterval: false,
  showTip: false,
  showScale: false,
  showProgressBar: false,
};

const parentHaveAllChildren = (parent: JQuery, children: string[]) => {
  const childrenCountInParent = children.reduce((childCount, childClass) => (
    childCount + parent.find(`.slider__${childClass}`).length
  ), 0);
  return childrenCountInParent === children.length;
};

describe('slider-plugin', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  let $sliderInstance: JQuery<HTMLElement>;

  beforeAll(() => {
    Object.defineProperty($sliderContainer[0], 'offsetWidth', { value: 700 });
  });

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
      expect(parentHaveAllChildren($controlContainer, childClasses)).toBe(true);
    });
  });

  describe('if called w/ custom state options that creates all possible subViews', () => {
    let $scaleElem: JQuery;

    beforeAll(() => {
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
      expect(parentHaveAllChildren($sliderInstance, childElements)).toBe(true);
      expect($scaleElem.children().length).toBe(21);
    });

    test('scale elements should have these style values and textContents', () => {
      $scaleElem.children().each((idx, sliderElem) => {
        expect(sliderElem.style.getPropertyValue('--scale-block-position'))
          .toBe(`${idx * 5}%`);
        expect(sliderElem.textContent?.trim()).toBe(String(-100 + (10 * idx)));
      });
    });
  });

  describe('if options arg passed to plugin is not an object or if it is an array (object that has length property)', () => {
    test.each([
      42, 'fail', [123, 'stepSize'], 321n, Symbol('symbol'),
    ])('should ignore %s argument and instantiate w/ default options', (arg: any) => {
      $sliderInstance = $sliderContainer.sliderPlugin(arg);

      expect($sliderInstance.debug.getOptions()).toStrictEqual(defaultOptions);
    });
  });

  describe('fixCustomOptions() should exclude wrong custom options from object that will be passed to Model', () => {
    test('should not include those properties in resulting options object that then passed to Model', () => {
      const falseOptions: Record<string, unknown> & Partial<IPluginOptions> = {
        test: 123,
      };

      $sliderInstance = $sliderContainer.sliderPlugin(falseOptions);

      expect($sliderInstance.debug.getOptions()).not.toHaveProperty('test');
    });

    test('should not consider options that are of wrong type', () => {
      const falseOptions: Record<string, unknown> = {
        stepSize: 'test',
      };

      $sliderInstance = $sliderContainer.sliderPlugin(falseOptions);

      expect($sliderInstance.debug.getOptions().stepSize).toBe(defaultOptions.stepSize);
    });

    test('should not consider options of type number that have non-finite values', () => {
      const options = {
        minValue: NaN,
        maxValue: Infinity,
        stepSize: -Infinity,
        value1: NaN,
        value2: Infinity,
      };

      $sliderInstance = $sliderContainer.sliderPlugin(options);

      getTypedKeys(options).forEach((option) => {
        expect($sliderInstance.debug.getOptions()[option])
          .toBe(defaultOptions[option]);
      });
    });
  });

  describe('checkOptionsValues() should check numeric values and correct them so plugin can work properly', () => {
    const dO = defaultOptions;
    test.concurrent
      .each<[(keyof IPluginValueOptions)[], number[], number[], boolean?]>([
        [['stepSize'], [-5], [5]],
        [['stepSize'], [0], [dO.stepSize]],
        [['minValue', 'maxValue'], [150, -70], [-70, 150]],
        [['minValue', 'maxValue'], [10, 10], [10, 10 + dO.stepSize]],
        [['value1', 'value2'], [40, -10], [-10, 40], true],
        [['value1'], [-200], [dO.minValue]],
        [['value1'], [200], [dO.maxValue - dO.stepSize], true],
        [['value1'], [200], [dO.maxValue]],
        [['value2'], [-200], [dO.minValue + dO.stepSize], true],
        [['value2'], [130], [dO.maxValue], true],
        [['stepSize'], [220], [1]],
      ])(
        'should correct wrong %p from %p to %p',
        async (parameters, wrong, right, isInterval = false) => {
          const wrongOptions: Partial<IPluginValueOptions> = {};
          parameters.forEach((parameter, idx) => {
            wrongOptions[parameter] = wrong[idx];
          });

          $sliderInstance = $sliderContainer.sliderPlugin({
            ...wrongOptions,
            ...{ isInterval },
          });

          const pluginOptions = $sliderInstance.debug.getOptions();
          parameters.forEach((parameter, idx) => {
            expect(pluginOptions[parameter] = right[idx]);
          });
        },
      );
  });

  const makePointerdown = (
    element: HTMLElement,
    offsetX: number,
    target?: HTMLElement,
  ) => {
    const pointerdownEvent = new MouseEvent('pointerdown');
    Object.defineProperties(pointerdownEvent, {
      pointerId: { value: 1 },
      offsetX: { value: offsetX },
      target: { value: target ?? element },
    });
    element.dispatchEvent(pointerdownEvent);
  };

  const makePointermove = async (
    targetElement: HTMLElement,
    startPoint: number,
    endPoint: number,
  ) => {
    const pointermoveEvent = new MouseEvent('pointermove');
    let cursorOffset = startPoint;
    jest.useFakeTimers();
    await new Promise<void>((resolve) => {
      const moveIntervalId = setInterval(() => {
        cursorOffset += (cursorOffset < endPoint ? 1 : -1);
        Object.defineProperty(pointermoveEvent, 'offsetX', {
          value: cursorOffset,
          writable: true,
        });
        targetElement.dispatchEvent(pointermoveEvent);
        if (cursorOffset === endPoint) {
          clearInterval(moveIntervalId);
          resolve();
        }
      }, 20);
      jest.runAllTimers();
      jest.useRealTimers();
    });
  };

  describe('DOM interaction with slider plugin on default options', () => {
    let controlContainer: HTMLElement;
    let pointerUpEvent: MouseEvent;

    beforeEach(() => {
      $sliderInstance = $sliderContainer.sliderPlugin();
      [controlContainer] = $sliderInstance.find('.slider__control-container');
      Object.defineProperties(controlContainer, {
        offsetWidth: { value: 680 },
        setPointerCapture: { value: jest.fn() },
      });
      pointerUpEvent = new MouseEvent('pointerup');
    });

    test('should set new value to --value-1-position (call View.setPosition()) after pointerdown event on controlContainer', () => {
      expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');

      [[102, 15], [219, 30], [-10, 0], [730, 100]].forEach(([offsetX, position]) => {
        makePointerdown(controlContainer, offsetX);
        expect(controlContainer.style.getPropertyValue('--value-1-position'))
          .toBe(`${position}%`);
        controlContainer.dispatchEvent(pointerUpEvent);
      });
    });

    test.each([
      [170, 188, 30],
      [170, 152, 20],
    ])(
      'should move thumb by pressing on it and moving from %d pixels offset to %d and set --value-1-position to %d%%',
      async (startPoint, endPoint, expectedPosition) => {
        const [thumbElem] = $sliderInstance.find('.slider__thumb_1');

        expect.assertions(2);
        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
        makePointerdown(controlContainer, startPoint, thumbElem);
        await makePointermove(controlContainer, startPoint, endPoint);
        controlContainer.dispatchEvent(pointerUpEvent);
        expect(controlContainer.style.getPropertyValue('--value-1-position'))
          .toBe(`${expectedPosition}%`);
      },
    );
  });
});
