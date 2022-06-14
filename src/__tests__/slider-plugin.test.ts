/**
 * @jest-environment jsdom
 */
/* eslint-disable fsd/no-function-declaration-in-event-listener */
import $ from 'jquery';
import '../slider-plugin';
import { getByText } from '@testing-library/dom';
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

const definePropertiesForControlContainer = (controlContainer: HTMLElement, offsetDimension: 'offsetWidth' | 'offsetHeight') => {
  Object.defineProperties(controlContainer, {
    [offsetDimension]: { value: 680 },
    setPointerCapture: { value: jest.fn() },
  });
};

describe('slider-plugin', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  const pointerupEvent = new MouseEvent('pointerup');
  let $sliderInstance: JQuery<HTMLElement>;

  beforeAll(() => {
    Object.defineProperties($sliderContainer[0], {
      offsetWidth: { value: 700 },
      offsetHeight: { value: 700 },
    });
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
    offsetAxis: 'offsetX' | 'offsetY',
    offset: number,
    target?: HTMLElement,
  ) => {
    const pointerdownEvent = new MouseEvent('pointerdown');
    Object.defineProperties(pointerdownEvent, {
      pointerId: { value: 1 },
      [offsetAxis]: { value: offset },
      target: { value: target ?? element },
    });
    element.dispatchEvent(pointerdownEvent);
  };

  const makePointermove = async (
    targetElement: HTMLElement,
    offsetAxis: 'offsetX' | 'offsetY',
    startPoint: number,
    endPoint: number,
  ) => {
    const pointermoveEvent = new MouseEvent('pointermove');
    let cursorOffset = startPoint;
    jest.useFakeTimers();
    await new Promise<void>((resolve) => {
      const moveIntervalId = setInterval(() => {
        cursorOffset += (cursorOffset < endPoint ? 1 : -1);
        Object.defineProperty(pointermoveEvent, offsetAxis, {
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

  describe('DOM interaction with default options', () => {
    let controlContainer: HTMLElement;

    beforeEach(() => {
      $sliderInstance = $sliderContainer.sliderPlugin();
      [controlContainer] = $sliderInstance.find('.slider__control-container');
      definePropertiesForControlContainer(controlContainer, 'offsetWidth');
    });

    test('should set new value to --value-1-position (call View.setPosition()) after pointerdown event on controlContainer', () => {
      expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');

      [[102, 15], [219, 30], [-10, 0], [730, 100]].forEach(([offsetX, position]) => {
        makePointerdown(controlContainer, 'offsetX', offsetX);
        controlContainer.dispatchEvent(pointerupEvent);

        expect(controlContainer.style.getPropertyValue('--value-1-position'))
          .toBe(`${position}%`);
      });
    });

    test.each([[188, 30], [152, 20], [-30, 0], [700, 100]])(
      'should move thumb by pressing on it and moving from 170 pixels offset to %d and set --value-1-position to %d%%',
      async (endPoint, expectedPosition) => {
        const [thumbElem] = $sliderInstance.find('.slider__thumb_1');
        const startPoint = 170;
        expect.assertions(2);
        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');

        makePointerdown(controlContainer, 'offsetX', startPoint, thumbElem);
        await makePointermove(controlContainer, 'offsetX', startPoint, endPoint);
        controlContainer.dispatchEvent(pointerupEvent);

        expect(controlContainer.style.getPropertyValue('--value-1-position'))
          .toBe(`${expectedPosition}%`);
      },
    );
  });

  describe.each([false, true])('if isVertical: %s', (isVertical) => {
    let controlContainer: HTMLElement;
    const offsetAxis = isVertical ? 'offsetY' : 'offsetX';
    const offsetDimension = isVertical ? 'offsetHeight' : 'offsetWidth';

    describe('DOM interaction on control-container with isInterval: false, showTip: true', () => {
      let tipElem: HTMLElement;

      beforeEach(() => {
        $sliderInstance = $sliderContainer.sliderPlugin(
          { isInterval: false, isVertical, showTip: true },
        );
        [controlContainer] = $sliderInstance.find('.slider__control-container');
        [tipElem] = $sliderInstance.find('.slider__tip_1');
        definePropertiesForControlContainer(controlContainer, offsetDimension);
      });

      test('should set new value to --value-1-position (call View.setPosition()) after pointerdown event on controlContainer', () => {
        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
        expect(tipElem.textContent).toBe('-50');

        [[359, 55, 10], [101, 15, -70], [16, 0, -100], [665, 100, 100]]
          .forEach(([offset, position, value]) => {
            makePointerdown(controlContainer, offsetAxis, offset);
            controlContainer.dispatchEvent(pointerupEvent);

            expect(controlContainer.style.getPropertyValue('--value-1-position'))
              .toBe(`${position}%`);
            expect(tipElem.textContent).toBe(`${value}`);
          });
      });

      test.each([
        [152, 20, -60], [297, 45, -10], [-30, 0, -100], [700, 100, 100],
      ])(
        'should move thumb by pressing on it and moving from 170 pixels offset to %d and set --value-1-position to %d%% and set value for tipElem to %d',
        async (endPoint, expectedPosition, value) => {
          const [thumbElem] = $sliderInstance.find('.slider__thumb_1');
          const startPoint = 170;
          expect.assertions(4);
          expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
          expect(tipElem.textContent).toBe('-50');

          makePointerdown(controlContainer, offsetAxis, startPoint, thumbElem);
          await makePointermove(controlContainer, offsetAxis, startPoint, endPoint);
          controlContainer.dispatchEvent(pointerupEvent);

          expect(controlContainer.style.getPropertyValue('--value-1-position'))
            .toBe(`${expectedPosition}%`);
          expect(tipElem.textContent).toBe(`${value}`);
        },
      );

      test.each([
        [324, 112, 15, -70], [22, 189, 30, -40], [623, 711, 100, 100], [412, -23, 0, -100],
      ])(
        'should move thumb by pressing on control-container and moving from %dpx offset to %dpx and set --value-1-position to %d%% and set value for tipElem to %d',
        async (startPoint, endPoint, expectedPosition, value) => {
          expect.assertions(4);
          expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
          expect(tipElem.textContent).toBe('-50');

          makePointerdown(controlContainer, offsetAxis, startPoint);
          await makePointermove(controlContainer, offsetAxis, startPoint, endPoint);
          controlContainer.dispatchEvent(pointerupEvent);

          expect(controlContainer.style.getPropertyValue('--value-1-position'))
            .toBe(`${expectedPosition}%`);
          expect(tipElem.textContent).toBe(`${value}`);
        },
      );
    });

    describe('DOM interaction on control-container with isInterval: true', () => {
      const tipElements: HTMLElement[] = [];

      beforeAll(() => {
        $sliderInstance = $sliderContainer.sliderPlugin(
          { isInterval: true, isVertical, showTip: true },
        );
        [controlContainer] = $sliderInstance.find('.slider__control-container');
        [tipElements[1]] = $sliderInstance.find('.slider__tip_1');
        [tipElements[2]] = $sliderInstance.find('.slider__tip_2');
        definePropertiesForControlContainer(controlContainer, offsetDimension);
      });

      afterEach(() => {
        // set default values
        $sliderInstance.setValue(1, defaultOptions.value1);
        $sliderInstance.setValue(2, defaultOptions.value2);
      });

      test.each([
        [1, 303, 45, -10], [2, 381, 55, 10], [1, 13, 0, -100], [2, 668, 100, 100],
      ])(
        'should move thumb%d located closer to click point %dpx and move it to %d%% position by pointerdown and set %d value to tipElem',
        (number, offset, position, value) => {
          expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
          expect(controlContainer.style.getPropertyValue('--value-2-position')).toBe('75%');
          expect(tipElements[1].textContent).toBe('-50');
          expect(tipElements[2].textContent).toBe('50');

          makePointerdown(controlContainer, offsetAxis, offset);
          expect(controlContainer.style.getPropertyValue(`--value-${number}-position`))
            .toBe(`${position}%`);
          expect(tipElements[number].textContent).toBe(`${value}`);
        },
      );

      test.each`
        activeThumb | startPoint | passiveThumbPoint | activeThumbExcess | expectedPosition | tipValue
        ${1}        | ${170}     | ${510}            | ${15}             | ${70}            | ${40}
        ${2}        | ${510}     | ${170}            | ${-15}            | ${30}            | ${-40}
      `(
        'should not set active thumb ($activeThumb) position beyond passive thumb position by pointermove',
        async ({
          activeThumb, startPoint, passiveThumbPoint, activeThumbExcess, expectedPosition, tipValue,
        }) => {
          expect.assertions(6);
          expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
          expect(controlContainer.style.getPropertyValue('--value-2-position')).toBe('75%');
          expect(tipElements[1].textContent).toBe('-50');
          expect(tipElements[2].textContent).toBe('50');
          const [activeThumbElem] = $sliderInstance.find(`.slider__thumb_${activeThumb}`);
          const activeThumbEndPoint = passiveThumbPoint + activeThumbExcess;

          makePointerdown(controlContainer, offsetAxis, startPoint, activeThumbElem);
          await makePointermove(controlContainer, offsetAxis, startPoint, activeThumbEndPoint);
          controlContainer.dispatchEvent(pointerupEvent);

          expect(controlContainer.style.getPropertyValue(`--value-${activeThumb}-position`))
            .toBe(`${expectedPosition}%`);
          expect(tipElements[activeThumb].textContent).toBe(`${tipValue}`);
        },
      );
    });

    describe('DOM interaction w/ slider__scale', () => {
      let scaleElem: HTMLElement;
      let pointerdownEvent: MouseEvent;
      const tipElements: HTMLElement[] = [];

      const initForScale = (isInterval: boolean) => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          showScale: true, isVertical, isInterval, showTip: true,
        });
        [controlContainer] = $sliderInstance.find('.slider__control-container');
        definePropertiesForControlContainer(controlContainer, offsetDimension);
        [scaleElem] = $sliderInstance.find('.slider__scale');
        [tipElements[1]] = $sliderInstance.find('.slider__tip_1');
        if (isInterval) [tipElements[2]] = $sliderInstance.find('.slider__tip_2');
        pointerdownEvent = new MouseEvent('pointerdown');
      };

      test('if isInterval: false, should set thumb1 on every clicked scale value position and set value for tip1', () => {
        initForScale(false);

        [...scaleElem.children].forEach((scaleValueElem, index) => {
          if (scaleValueElem instanceof HTMLDivElement) {
            Object.defineProperty(pointerdownEvent, 'target', {
              value: scaleValueElem.firstElementChild, writable: true,
            });
            scaleElem.dispatchEvent(pointerdownEvent);
            scaleElem.dispatchEvent(pointerupEvent);

            const scaleBlockPosition = scaleValueElem.style.getPropertyValue('--scale-block-position');
            expect(controlContainer.style.getPropertyValue('--value-1-position'))
              .toBe(scaleBlockPosition);
            expect(tipElements[1].textContent)
              .toBe(String(defaultOptions.minValue + defaultOptions.stepSize * index));
          }
        });
      });

      test('if isInterval: true, should move closest thumb to position of clicked scale value', () => {
        initForScale(true);

        [[0, 1], [30, 2], [-40, 1], [70, 2]].forEach(([scaleValue, number]) => {
          const scaleTextElem = getByText(scaleElem, String(scaleValue));
          Object.defineProperty(pointerdownEvent, 'target', {
            value: scaleTextElem, writable: true,
          });
          scaleElem.dispatchEvent(pointerdownEvent);
          scaleElem.dispatchEvent(pointerupEvent);

          const scaleBlockPosition = scaleTextElem?.parentElement?.style
            .getPropertyValue('--scale-block-position');
          expect(controlContainer.style.getPropertyValue(`--value-${number}-position`))
            .toBe(scaleBlockPosition);
          expect(tipElements[number].textContent).toBe(String(scaleValue));
        });
      });
    });

    test.todo('check thumb move from penultimate position to max, and vice versa, by pointerdown & pointermove in conditions where distance between penultimate and max is less than between other couples');
  });

  describe('customizations through API', () => {
    test.each([false, true])('if called setInterval(true), should: add class slider__interval, create thumb2 and set position to it; if showTip: true, create tip2 and set a value to it; calling setInterval(false) should delete thumb2 and if showTip: true, delete it too', (showTip) => {
      $sliderInstance = $sliderContainer.sliderPlugin({ showTip });
      const [controlContainer] = $sliderInstance.find('.slider__control-container');
      let $tipElements: JQuery;
      expect($sliderInstance.hasClass('slider_interval')).toBe(false);
      expect($sliderInstance.find('.slider__thumb').length).toBe(1);
      if (showTip) {
        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(1);
      }

      $sliderInstance.setInterval(true);

      expect($sliderInstance.hasClass('slider_interval')).toBe(true);
      expect(controlContainer.style.getPropertyValue('--value-2-position')).toBe('75%');
      expect($sliderInstance.find('.slider__thumb').length).toBe(2);
      if (showTip) {
        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(2);
        expect($tipElements[1].textContent).toBe('50');
      }

      $sliderInstance.setInterval(false);

      expect($sliderInstance.hasClass('slider_interval')).toBe(false);
      expect($sliderInstance.find('.slider__thumb').length).toBe(1);
      if (showTip) {
        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(1);
        expect($tipElements.hasClass('slider__tip_1')).toBe(true);
      }
    });

    test('if called setShowProgress(), should toggle \'slider__show-progress\' on $sliderInstance', () => {
      $sliderInstance = $sliderContainer.sliderPlugin();
      expect($sliderInstance.hasClass('slider_show-progress')).toBe(false);

      $sliderInstance.setShowProgress(true);

      expect($sliderInstance.hasClass('slider_show-progress')).toBe(true);

      $sliderInstance.setShowProgress(false);

      expect($sliderInstance.hasClass('slider_show-progress')).toBe(false);
    });
  });
});
