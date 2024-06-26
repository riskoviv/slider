import $ from 'jquery';
import '@testing-library/jest-dom';
import { getByText } from '@testing-library/dom';

import './mocks/ResizeObserver';
import '../src/slider-plugin';
import {
  getTypedKeys, getFractionalPartSize, defaultOptions, anyTypeValues,
} from '../src/utils';

const parentHaveAllChildren = (parent: JQuery, children: string[]) => {
  const childrenCountInParent = children.reduce((childCount, childClass) => (
    childCount + parent.find(`.slider__${childClass}`).length
  ), 0);
  return childrenCountInParent === children.length;
};

const definePropertiesForControlContainer = (
  controlContainer: HTMLElement,
  offsetDimension: 'offsetWidth' | 'offsetHeight',
) => {
  Object.defineProperties(controlContainer, {
    [offsetDimension]: { value: 680 },
    setPointerCapture: { value: jest.fn() },
  });
};

const getRandomInt = (min: number, max: number) => (
  Math.floor(Math.random() * (max - min + 1) + min)
);

const tipHiddenClass = 'slider__tip_hidden';

const areTipsJoinedToOne = (tipElements: HTMLElement[]): boolean => {
  const tipsVisibilities = [1, 2, 3].map(
    (n) => tipElements[n].classList.contains(tipHiddenClass),
  );
  const joinedTips = [true, true, false];
  return tipsVisibilities.every((tipStatus, idx) => tipStatus === joinedTips[idx]);
};

describe('slider-plugin', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  const pointerupEvent = new MouseEvent('pointerup');
  let $sliderInstance: JQuery;

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
      ['setValue1', 'setValue2', 'setVerticalState', 'setInterval', 'setShowProgress', 'setShowTip', 'setShowScale', 'setStepSize', 'setMinValue', 'setMaxValue']
        .forEach((methodName) => {
          expect($sliderInstance).toHaveProperty(methodName);
        });
      expect($sliderInstance.hasClass('slider')).toBe(true);
    });

    test('getOptions returns the same object as defaultOptions (by content)', () => {
      const sliderOptions = $sliderInstance.getOptions();

      expect(sliderOptions).toEqual(defaultOptions);
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
      const childElements = ['control-container', 'track', 'thumb_1', 'thumb_2', 'tip_1', 'tip_2', 'tip_3', 'scale'];
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
    test.each([42, ...anyTypeValues])('should ignore %s argument and instantiate w/ default options', (arg: any) => {
      $sliderInstance = $sliderContainer.sliderPlugin(arg);

      expect($sliderInstance.getOptions()).toStrictEqual(defaultOptions);
    });
  });

  describe('fixCustomOptions() should exclude wrong custom options from object that will be passed to Model', () => {
    test('should not include those properties in resulting options object that then passed to Model', () => {
      const falseOptions: Record<string, unknown> & Partial<SliderOptions> = {
        test: 123,
      };

      $sliderInstance = $sliderContainer.sliderPlugin(falseOptions);

      expect($sliderInstance.getOptions()).not.toHaveProperty('test');
    });

    test('should not consider options that are of wrong type', () => {
      const falseOptions: Record<string, unknown> = {
        stepSize: 'test',
      };

      $sliderInstance = $sliderContainer.sliderPlugin(falseOptions);

      expect($sliderInstance.getOptions().stepSize).toBe(defaultOptions.stepSize);
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
        expect($sliderInstance.getOptions()[option])
          .toBe(defaultOptions[option]);
      });
    });
  });

  describe('checkOptionsValues() should check numeric values and correct them so plugin can work properly', () => {
    const dO = defaultOptions;
    test.concurrent
      .each<[(keyof ValueOptions)[], number[], number[], boolean?]>([
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
          const wrongOptions: Partial<ValueOptions> = {};
          parameters.forEach((parameter, idx) => {
            wrongOptions[parameter] = wrong[idx];
          });

          $sliderInstance = $sliderContainer.sliderPlugin({
            ...wrongOptions,
            isInterval,
          });

          const pluginOptions = $sliderInstance.getOptions();
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
    makePointerup?: boolean,
    target?: HTMLElement,
    button?: number,
  ) => {
    const pointerdownEvent = new MouseEvent('pointerdown');
    Object.defineProperties(pointerdownEvent, {
      pointerId: { value: 1 },
      [offsetAxis]: { value: offset },
      target: { value: target ?? element },
      button: { value: button ?? 0 },
    });
    element.dispatchEvent(pointerdownEvent);
    if (makePointerup !== false) element.dispatchEvent(pointerupEvent);
  };

  const makePointermove = async (
    targetElement: HTMLElement,
    offsetAxis: 'offsetX' | 'offsetY',
    startPoint: number,
    endPoint: number,
    makePointerup = true,
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
          if (makePointerup) targetElement.dispatchEvent(pointerupEvent);
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

        makePointerdown(controlContainer, 'offsetX', startPoint, false, thumbElem);
        await makePointermove(controlContainer, 'offsetX', startPoint, endPoint);

        expect(controlContainer.style.getPropertyValue('--value-1-position'))
          .toBe(`${expectedPosition}%`);
      },
    );
  });

  describe.each([false, true])('DOM interaction with slider, if isVertical: %s', (isVertical) => {
    let controlContainer: HTMLElement;
    const offsetAxis = isVertical ? 'offsetY' : 'offsetX';
    const offsetDimension = isVertical ? 'offsetHeight' : 'offsetWidth';
    const positionDimension = isVertical ? 'offsetTop' : 'offsetLeft';

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

          makePointerdown(controlContainer, offsetAxis, startPoint, false, thumbElem);
          await makePointermove(controlContainer, offsetAxis, startPoint, endPoint);

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

          makePointerdown(controlContainer, offsetAxis, startPoint, false);
          await makePointermove(controlContainer, offsetAxis, startPoint, endPoint);

          expect(controlContainer.style.getPropertyValue('--value-1-position'))
            .toBe(`${expectedPosition}%`);
          expect(tipElem.textContent).toBe(`${value}`);
        },
      );

      describe('joining and separating of tips', () => {
        const tips: HTMLElement[] = [];

        const setTipPositionAndSize = (
          tipElement: HTMLElement,
          position: number,
          size: number,
        ) => {
          Object.defineProperties(tipElement, {
            [positionDimension]: { value: position, writable: true },
            [offsetDimension]: { value: size, writable: true },
          });
        };

        beforeEach(() => {
          $sliderInstance = $sliderContainer.sliderPlugin({
            isInterval: true, isVertical, showTip: true, stepSize: 5,
          });
          const $controlContainer = $sliderInstance.find('.slider__control-container');
          [controlContainer] = $controlContainer;
          definePropertiesForControlContainer($controlContainer[0], offsetDimension);
          [1, 2, 3].forEach((number) => {
            [tips[number]] = $controlContainer.find(`.slider__tip_${number}`);
          });
        });

        test('because positions & sizes of tips in test initially will be all at 0 and they cannot be set before initialization, tip1 & tip2 will be hidden and tip3 will be shown', () => {
          expect(areTipsJoinedToOne(tips)).toBe(true);
        });

        test('tip1&2 should be hidden and tip3 shown when tip1&2 overlapping each other and should be vice versa when they\'re not overlapping', async () => {
          expect.assertions(6);
          const [thumb1] = $sliderInstance.find('.slider__thumb_1');
          const [thumb2] = $sliderInstance.find('.slider__thumb_2');
          const dragStart1 = 170;
          const dragEnd1 = 487;
          const tip1Position1 = 493;
          const tip2Position1 = 510;
          setTipPositionAndSize(tips[1], tip1Position1, isVertical ? 21 : 37);
          setTipPositionAndSize(tips[2], tip2Position1, isVertical ? 21 : 37);

          makePointerdown(controlContainer, offsetAxis, dragStart1, false, thumb1);
          await makePointermove(controlContainer, offsetAxis, dragStart1, dragEnd1);

          expect(tips[1].textContent).toBe('45');
          expect(tips[2].textContent).toBe('50');
          expect(areTipsJoinedToOne(tips)).toBe(true);

          const dragStart2 = 512;
          const dragEnd2 = 577;
          const tip2Position2 = 578;
          setTipPositionAndSize(tips[2], tip2Position2, isVertical ? 21 : 37);

          makePointerdown(controlContainer, offsetAxis, dragStart2, false, thumb2);
          await makePointermove(controlContainer, offsetAxis, dragStart2, dragEnd2);

          expect(tips[1].textContent).toBe('45');
          expect(tips[2].textContent).toBe('70');
          expect(areTipsJoinedToOne(tips)).toBe(false);
        });
      });
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
        $sliderInstance.setValue1(defaultOptions.value1);
        $sliderInstance.setValue2(defaultOptions.value2);
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

      test.each([
        [1, 170, 680, 70, 40],
        [2, 510, 0, 30, -40],
      ])(
        'should not set active thumb (%i) position beyond passive thumb position by pointermove',
        async (activeThumb, startPoint, activeThumbEndPoint, expectedPosition, tipValue) => {
          expect.assertions(6);
          expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('25%');
          expect(controlContainer.style.getPropertyValue('--value-2-position')).toBe('75%');
          expect(tipElements[1].textContent).toBe('-50');
          expect(tipElements[2].textContent).toBe('50');
          const [activeThumbElem] = $sliderInstance.find(`.slider__thumb_${activeThumb}`);

          makePointerdown(controlContainer, offsetAxis, startPoint, false, activeThumbElem);
          await makePointermove(
            controlContainer,
            offsetAxis,
            startPoint,
            activeThumbEndPoint,
          );

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

        [...scaleElem.children].forEach((scaleValueElem) => {
          if (scaleValueElem instanceof HTMLDivElement) {
            Object.defineProperty(pointerdownEvent, 'target', {
              value: scaleValueElem.firstElementChild, writable: true,
            });
            scaleElem.dispatchEvent(pointerdownEvent);
            scaleElem.dispatchEvent(pointerupEvent);

            const scaleBlockPosition = scaleValueElem.style.getPropertyValue('--scale-block-position');
            expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe(scaleBlockPosition);
            expect(tipElements[1].textContent).toBe(scaleValueElem.firstElementChild?.textContent);
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

    describe('thumb moving from penultimate position to max and vice versa', () => {
      beforeAll(() => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          showTip: true, value1: 80, stepSize: 30, isVertical,
        });
        [controlContainer] = $sliderInstance.find('.slider__control-container');
        definePropertiesForControlContainer(controlContainer, offsetDimension);
      });

      test('should move thumb from penultimate position to max and vice versa by pointerdown on controlContainer, pressing over halfStepFromPenultimateToMax from penultimate position', () => {
        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('90%');
        const tipElem = controlContainer.querySelector('.slider__tip_1');
        expect(tipElem?.textContent).toBe('80');

        makePointerdown(controlContainer, offsetAxis, 648);

        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('100%');
        expect(tipElem?.textContent).toBe('100');

        makePointerdown(controlContainer, offsetAxis, 645);

        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('90%');
        expect(tipElem?.textContent).toBe('80');
      });

      test('should move thumb from penultimate position to max and vice versa by pointermove, dragging over halfStepFromPenultimateToMax from penultimate position', async () => {
        expect.assertions(6);
        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('90%');
        const tipElem = controlContainer.querySelector('.slider__tip_1');
        expect(tipElem?.textContent).toBe('80');

        makePointerdown(controlContainer, offsetAxis, 612, false);
        await makePointermove(controlContainer, offsetAxis, 612, 648);

        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('100%');
        expect(tipElem?.textContent).toBe('100');

        makePointerdown(controlContainer, offsetAxis, 680, false);
        await makePointermove(controlContainer, offsetAxis, 680, 645);

        expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('90%');
        expect(tipElem?.textContent).toBe('80');
      });
    });

    describe('if event.button !== 0, interactive components as controlContainer and scale should not react', () => {
      const getSliderElem = (elementName: string): HTMLElement => {
        $sliderInstance = $sliderContainer.sliderPlugin(
          { isVertical, showScale: elementName === 'scale' },
        );
        const [element] = $sliderInstance.find(`.slider__${elementName}`);
        return element;
      };

      test.each(['control-container', 'scale'])(
        '%s should not react to event w/ button !== 0 (e.g. RMB, MMB)',
        (elementName) => {
          const element = getSliderElem(elementName);
          const randomClickPoint = getRandomInt(0, 680);
          const randomButton = getRandomInt(1, 2);
          const $controlContainer = $sliderInstance.find('.slider__control-container');
          expect($controlContainer.css('--value-1-position')).toBe('25%');

          makePointerdown(element, offsetAxis, randomClickPoint, true, element, randomButton);

          expect($controlContainer.css('--value-1-position')).toBe('25%');
        },
      );
    });
  });

  describe('customizations through API', () => {
    test.each([false, true])('setInterval(true) should: add class slider__interval, create thumb2 and set position to it; if showTip: true, create tip2 and set a value to it; calling setInterval(false) should delete thumb2 and if showTip: true, delete it too', (showTip) => {
      $sliderInstance = $sliderContainer.sliderPlugin({ showTip });
      const $controlContainer = $sliderInstance.find('.slider__control-container');
      let $tipElements: JQuery;
      expect($sliderInstance.hasClass('slider_interval')).toBe(false);
      expect($sliderInstance.find('.slider__thumb').length).toBe(1);
      if (showTip) {
        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(1);
      }

      $sliderInstance.setInterval(true);

      expect($sliderInstance.hasClass('slider_interval')).toBe(true);
      expect($controlContainer.css('--value-2-position')).toBe('75%');
      expect($sliderInstance.find('.slider__thumb').length).toBe(2);
      if (showTip) {
        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(3);
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

    test('setShowProgress() should toggle class slider__show-progress on $sliderInstance', () => {
      $sliderInstance = $sliderContainer.sliderPlugin();
      expect($sliderInstance.hasClass('slider_show-progress')).toBe(false);

      $sliderInstance.setShowProgress(true);

      expect($sliderInstance.hasClass('slider_show-progress')).toBe(true);

      $sliderInstance.setShowProgress(false);

      expect($sliderInstance.hasClass('slider_show-progress')).toBe(false);
    });

    test('setValue() should fix value if it is not allowed considering stepSize, set new position to thumb according to that value, set value to tip if showTip: true', () => {
      $sliderInstance = $sliderContainer.sliderPlugin({
        showTip: true, isInterval: true,
      });
      const [controlContainer] = $sliderInstance.find('.slider__control-container');
      const $tipElements = $sliderInstance.find('.slider__tip');

      $sliderInstance.setValue1(-35);
      $sliderInstance.setValue2(83);

      expect(controlContainer.style.getPropertyValue('--value-1-position')).toBe('35%');
      expect(controlContainer.style.getPropertyValue('--value-2-position')).toBe('90%');
      expect($tipElements[0].textContent).toBe('-30');
      expect($tipElements[1].textContent).toBe('80');
    });

    describe('setVerticalState()', () => {
      test('should toggle slider_vertical class on slider instance element', () => {
        $sliderInstance = $sliderContainer.sliderPlugin();
        expect($sliderInstance.hasClass('slider_vertical')).toBe(false);

        $sliderInstance.setVerticalState(true);

        expect($sliderInstance.hasClass('slider_vertical')).toBe(true);

        $sliderInstance.setVerticalState(false);

        expect($sliderInstance.hasClass('slider_vertical')).toBe(false);
      });

      const setTipPositionAndSize = (
        tipElement: HTMLElement,
        position: number,
        size: number,
        positionDimension: PositionDimension,
        offsetDimension: SizeDimension,
      ) => {
        Object.defineProperties(tipElement, {
          [positionDimension]: { value: position, writable: true },
          [offsetDimension]: { value: size, writable: true },
        });
      };

      test('should join/separate tips, when in horizontal they\'re joined but in vertical not', () => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          isInterval: true,
          showTip: true,
        });
        const tips: HTMLElement[] = [];
        [1, 2, 3].forEach((number) => {
          [tips[number]] = $sliderInstance.find(`.slider__tip_${number}`);
        });

        setTipPositionAndSize(tips[1], 204, 42, 'offsetLeft', 'offsetWidth');
        setTipPositionAndSize(tips[2], 238, 42, 'offsetLeft', 'offsetWidth');
        $sliderInstance.setValue1(-40).setValue2(-30);

        expect(areTipsJoinedToOne(tips)).toBe(true);

        setTipPositionAndSize(tips[1], 204, 21, 'offsetTop', 'offsetHeight');
        setTipPositionAndSize(tips[2], 238, 21, 'offsetTop', 'offsetHeight');
        $sliderInstance.setVerticalState(true);

        expect(areTipsJoinedToOne(tips)).toBe(false);
      });

      test('should init resize observer when showScale is true', () => {
        $sliderInstance = $sliderContainer.sliderPlugin({ showScale: true });

        $sliderInstance.setVerticalState(true);

        expect(ResizeObserver).toHaveBeenCalledTimes(1);
      });
    });

    test.each([false, true])(
      'setShowTip() should cause adding/removing of tip element(s) on controlContainer and set values in them',
      (isInterval) => {
        $sliderInstance = $sliderContainer.sliderPlugin({ isInterval });
        const tipsCount = isInterval ? 3 : 1;
        let $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(0);

        $sliderInstance.setShowTip(true);

        $tipElements = $sliderInstance.find('.slider__tip');
        expect($tipElements.length).toBe(tipsCount);
        expect($tipElements[0].textContent).toBe('-50');
        if (isInterval) expect($tipElements[1].textContent).toBe('50');

        $sliderInstance.setShowTip(false);

        expect($sliderInstance.find('.slider__tip').length).toBe(0);
      },
    );

    describe('setShowScale()', () => {
      let mockResizeObserver: jest.MockedClass<typeof ResizeObserver>;

      beforeAll(() => {
        mockResizeObserver = ResizeObserver as jest.MockedClass<typeof ResizeObserver>;
      });

      test('setShowScale(true) should create scale element and fill w/ value elements; setShowScale(false) should remove scale element', () => {
        $sliderInstance = $sliderContainer.sliderPlugin();
        expect($sliderInstance.find('.slider__scale').length).toBe(0);

        $sliderInstance.setShowScale(true);

        const $sliderScaleElem = $sliderInstance.find('.slider__scale');
        expect($sliderScaleElem.length).toBe(1);
        expect($sliderScaleElem.children().length).toBe(21);
        expect(mockResizeObserver).toBeCalled();
        const [resizeObserverInstance] = mockResizeObserver.mock.instances;
        expect(resizeObserverInstance.observe).toBeCalledTimes(1);

        $sliderInstance.setShowScale(false);

        expect($sliderInstance.find('.slider__scale').length).toBe(0);
        expect(resizeObserverInstance.disconnect).toBeCalledTimes(1);
      });

      test('if showTip: true & isInterval: true, setShowScale(false) should remove scale but remain ResizeObserver', () => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          showTip: true, isInterval: true, showScale: true,
        });

        expect(mockResizeObserver).toBeCalled();

        const [resizeObserverInstance] = mockResizeObserver.mock.instances;

        $sliderInstance.setShowScale(false);

        expect(resizeObserverInstance.disconnect).not.toBeCalled();
      });
    });

    const getScaleValuesMaxFractionalPrecision = ($scale: JQuery) => {
      const valuesFractionSizes = [...$scale.find('.slider__scale-text')]
        .map((scaleTextElem) => getFractionalPartSize(scaleTextElem.textContent ?? ''));
      return Math.max(...valuesFractionSizes);
    };

    const areDifferencesBetweenAllScaleValuesEqualToStepSize = (
      $scale: JQuery,
      stepSize: number,
    ) => {
      const scaleValues = $scale.find('.slider__scale-text')
        .map((idx, scaleElement) => Number(scaleElement.textContent)).get();
      const stepSizePrecision = getFractionalPartSize(String(stepSize));
      const areDifferencesEqual = scaleValues.slice(0, scaleValues.length - 1)
        .every((scaleValue, idx, values) => {
          if (values[idx + 1] !== undefined) {
            return Number((values[idx + 1] - scaleValue).toFixed(stepSizePrecision)) === stepSize;
          }
          return true;
        });
      return areDifferencesEqual;
    };

    test('setStepSize(number) should update positions of thumb1 & 2, update values in tips, update scale values', () => {
      $sliderInstance = $sliderContainer.sliderPlugin({
        isInterval: true, showTip: true, showScale: true,
      });
      const $controlContainer = $sliderInstance.find('.slider__control-container');

      $sliderInstance.setStepSize(23.54);

      expect($controlContainer.css('--value-1-position')).toBe('23.54%');
      expect($controlContainer.css('--value-2-position')).toBe('70.62%');
      expect($controlContainer.find('.slider__tip_1').text()).toBe('-52.92');
      expect($controlContainer.find('.slider__tip_2').text()).toBe('41.24');
      const $sliderScale = $sliderInstance.find('.slider__scale');
      expect($sliderScale.children().length).toBe(10);
      expect(getScaleValuesMaxFractionalPrecision($sliderScale)).toBe(2);
      expect(areDifferencesBetweenAllScaleValuesEqualToStepSize($sliderScale, 23.54))
        .toBe(true);
    });

    test.each<['Min' | 'Max', string, number[][], string]>([
      ['Min', 'minValue', [[-80, -50, 50], [10.3, 10.3, 50.3], [-43.12, 6.88, 46.88]], 'first'],
      ['Max', 'maxValue', [[80, -50, 50], [-5.1, -50, -5.1], [84.37, -50, -10]], 'last'],
    ])(
      'set%sValue(number) should update %s, fractionalPrecision, scale values',
      (minMax, valueName, values, childType) => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          isInterval: true, showTip: true, showScale: true,
        });
        const $scaleElem = $sliderInstance.find('.slider__scale');
        const $tip1 = $sliderContainer.find('.slider__tip_1');
        const $tip2 = $sliderContainer.find('.slider__tip_2');

        values.forEach(([minMaxValue, value1, value2]) => {
          $sliderInstance[`set${minMax}Value`](minMaxValue);
          const $scaleEdgeElem = $scaleElem
            .find(`.slider__scale-block:${childType}-child > .slider__scale-text`);
          const valueFractionSize = getFractionalPartSize(`${minMaxValue}`);
          const scaleElementsFractionSize = getScaleValuesMaxFractionalPrecision($scaleElem);

          expect($scaleEdgeElem.text()).toBe(`${minMaxValue}`);
          expect($tip1.text()).toBe(`${value1}`);
          expect($tip2.text()).toBe(`${value2}`);
          expect(scaleElementsFractionSize).toBe(valueFractionSize);
        });
      },
    );
  });

  describe('API methods', () => {
    describe('subscribe & unsubscribe', () => {
      let controlContainer: HTMLElement;

      beforeEach(() => {
        $sliderInstance = $sliderContainer.sliderPlugin({ isInterval: true });
        [controlContainer] = $sliderInstance.find('.slider__control-container');
        definePropertiesForControlContainer(controlContainer, 'offsetWidth');
      });

      test('should change inputs values after pointerdown event on controlContainer', () => {
        const inputElement1: UnsubHTMLInputElement = document.createElement('input');
        inputElement1.type = 'number';
        $sliderInstance.subscribe({ event: 'value1Changed', subscriber: inputElement1 });
        const inputElement2: UnsubHTMLInputElement = document.createElement('input');
        inputElement2.type = 'number';
        $sliderInstance.subscribe({ event: 'value2Changed', subscriber: inputElement2 });

        makePointerdown(controlContainer, 'offsetX', 251);
        makePointerdown(controlContainer, 'offsetX', 415);

        const { value1, value2 } = $sliderInstance.getOptions();
        expect(value1).toBe(-30);
        expect(value2).toBe(20);
        expect(inputElement1.valueAsNumber).toBe(value1);
        expect(inputElement2.valueAsNumber).toBe(value2);

        $sliderInstance.unsubscribe(inputElement1);
        makePointerdown(controlContainer, 'offsetX', 96);

        expect($sliderInstance.getOptions().value1).toBe(-70);
        expect(inputElement1.valueAsNumber).toBe(value1);

        expect(inputElement2.unsubscribe).toBeDefined();
        if (inputElement2.unsubscribe !== undefined) inputElement2.unsubscribe();
        makePointerdown(controlContainer, 'offsetX', 568);

        expect($sliderInstance.getOptions().value2).toBe(70);
        expect(inputElement2.valueAsNumber).toBe(value2);
      });

      test.concurrent.each`
        inputType     | event                  | inputProperty      | value1   | value2  | method
        ${'number'}   | ${'value1Changed'}     | ${'valueAsNumber'} | ${20}    | ${30}   | ${'setValue1'}
        ${'number'}   | ${'stepSizeChanged'}   | ${'valueAsNumber'} | ${2}     | ${6}    | ${'setStepSize'}
        ${'checkbox'} | ${'isIntervalChanged'} | ${'checked'}       | ${false} | ${true} | ${'setInterval'}
      `(
        'should subscribe input[type="$inputType"] element to $event event and change its $inputProperty property to value ($value1) emitted on event dispatch, but after unsubscribe() new value ($value2) passed to method should not be set on inputElement',
        ({
          inputType, event, inputProperty, value1, value2, method,
        }: {
          inputType: 'number',
          event: ValueEvent,
          value1: number,
          value2: number,
          inputProperty: 'valueAsNumber',
          method: keyof ModelValueMethods,
        } | {
          inputType: 'checkbox',
          event: StateEvent,
          value1: boolean,
          value2: boolean,
          inputProperty: 'checked',
          method: keyof ModelStateMethods,
        }) => {
          let isUnsubscribed = false;
          const inputElement: UnsubHTMLInputElement = document.createElement('input');
          inputElement.type = inputType;
          $sliderInstance.subscribe({ event, subscriber: inputElement });

          switch (inputType) {
            case 'number':
              $sliderInstance[method](value1);
              break;
            case 'checkbox':
              $sliderInstance[method](value1);
              break;
            default: break;
          }

          expect(inputElement[inputProperty]).toBe(value1);

          if (Math.round(Math.random())) {
            isUnsubscribed = $sliderInstance.unsubscribe(inputElement);
          } else if (inputElement.unsubscribe !== undefined) {
            isUnsubscribed = inputElement.unsubscribe();
          }

          expect(isUnsubscribed).toBe(true);

          switch (inputType) {
            case 'number':
              $sliderInstance[method](value2);
              break;
            case 'checkbox':
              $sliderInstance[method](value2);
              break;
            default: break;
          }

          expect(inputElement[inputProperty]).toBe(value1);
        },
      );

      type Primitive = number | boolean;
      type Callback<Value> = ((value: Value) => void) & Unsubscribable;

      describe('callback subscribe / unsubscribe', () => {
        let variableChangedByCallback: Primitive | undefined;

        beforeEach(() => {
          variableChangedByCallback = undefined;
        });

        test.each`
          event                    | value1  | value2   | method
          ${'value1Changed'}       | ${30}   | ${40}    | ${'setValue1'}
          ${'showProgressChanged'} | ${true} | ${false} | ${'setShowProgress'}
        `(
          "should subscribe callback function to event and call it on event passing it value changed during event, and don't call callback after unsubscribe",
          ({
            event, value1, value2, method,
          }: {
            event: ValueEvent;
            value1: number;
            value2: number;
            method: keyof ModelValueMethods;
          } | {
            event: StateEvent;
            value1: boolean;
            value2: boolean;
            method: keyof ModelStateMethods;
          }) => {
            let isUnsubscribed = false;
            const callback: Callback<typeof value1> = (value: typeof value1) => {
              variableChangedByCallback = value;
            };
            $sliderInstance.subscribe({ event, subscriber: callback });

            switch (event) {
              case 'value1Changed':
                $sliderInstance[method](value1);
                break;
              case 'showProgressChanged':
                $sliderInstance[method](value1);
                break;
              default:
                break;
            }

            expect(variableChangedByCallback).toBe(value1);

            if (Math.round(Math.random())) isUnsubscribed = $sliderInstance.unsubscribe(callback);
            else if (callback.unsubscribe) isUnsubscribed = callback.unsubscribe();

            switch (event) {
              case 'value1Changed':
                $sliderInstance[method](value2);
                break;
              case 'showProgressChanged':
                $sliderInstance[method](value2);
                break;
              default:
                break;
            }

            expect(isUnsubscribed).toBe(true);
            expect(variableChangedByCallback).toBe(value1);
          },
        );
      });

      test('unsubscribe() should return false if received value is other than HTMLInputElement or Function', () => {
        const notUnsubscribable: any = { test: true };
        expect($sliderInstance.unsubscribe(notUnsubscribable)).toBe(false);
      });
    });

    describe('destroySlider clears container & instance from its elements, instance methods (including destroySlider) should be deleted and options should become unchangeable', () => {
      type HTMLElementWithDestroy = HTMLElement & {
        destroySlider?(): boolean
      };
      type JQueryHTMLElementWithDestroy = JQuery & {
        0?: HTMLElementWithDestroy
      };
      let $sliderContainerForDestroy: JQueryHTMLElementWithDestroy = $('<div class="slider-container"></div>');
      let $sliderInstanceForDestroy = $sliderContainerForDestroy.sliderPlugin();

      afterEach(() => {
        $sliderContainerForDestroy = $('<div class="slider-container"></div>');
        $sliderInstanceForDestroy = $sliderContainerForDestroy.sliderPlugin();
      });

      test('should destroy slider if method is called on slider instance', () => {
        expect($sliderContainerForDestroy[0]).toHaveProperty('destroySlider');
        expect($sliderContainerForDestroy[0]).not.toBeEmptyDOMElement();
        expect($sliderInstanceForDestroy[0]).not.toBeEmptyDOMElement();

        $sliderInstanceForDestroy.destroySlider();

        expect($sliderContainerForDestroy[0]).not.toHaveProperty('destroySlider');
        expect($sliderContainerForDestroy[0]).toBeEmptyDOMElement();
        expect(Object.keys($sliderInstanceForDestroy)).toEqual(['length']);
        expect(() => {
          $sliderInstanceForDestroy.setValue1(1);
        }).toThrow(TypeError);
      });

      test('should destroy slider if method is called on slider container', () => {
        expect($sliderContainerForDestroy[0]).toHaveProperty('destroySlider');
        expect($sliderContainerForDestroy[0]).not.toBeEmptyDOMElement();
        expect($sliderInstanceForDestroy[0]).not.toBeEmptyDOMElement();

        if ($sliderContainerForDestroy[0]?.destroySlider !== undefined) {
          $sliderContainerForDestroy[0]?.destroySlider();
        }

        expect($sliderContainerForDestroy[0]).not.toHaveProperty('destroySlider');
        expect($sliderContainerForDestroy[0]).toBeEmptyDOMElement();
        expect(Object.keys($sliderInstanceForDestroy)).toEqual(['length']);
        expect(() => {
          $sliderInstanceForDestroy.setValue1(1);
        }).toThrow(TypeError);
      });
    });
  });

  describe.each([false, true])('edge cases tests, isVertical: %s', (isVertical) => {
    const offsetDimension = isVertical ? 'offsetHeight' : 'offsetWidth';
    const offsetAxis = isVertical ? 'offsetY' : 'offsetX';

    test('if slider container size is small to fit all scale elements, slider__scale will have only every 2nd value element', () => {
      const $smallSliderContainer = $('<div class="slider-container"></div>');
      Object.defineProperty(
        $smallSliderContainer[0],
        isVertical ? 'offsetHeight' : 'offsetWidth',
        { value: 70 },
      );
      const $smallSliderInstance = $smallSliderContainer.sliderPlugin({
        showScale: true, isVertical,
      });

      expect($smallSliderInstance.find('.slider__scale-block').length).toBe(11);
    });

    test('scale should have last element containing maxValue and located at 100% position', () => {
      $sliderInstance = $sliderContainer.sliderPlugin({
        showScale: true, stepSize: 3, isVertical,
      });
      const $sliderScale = $sliderInstance.find('.slider__scale');
      const $lastScaleChild = $sliderScale.children().last();

      expect($lastScaleChild.css('--scale-block-position')).toBe('100%');
      expect($lastScaleChild.text().trim()).toBe(`${defaultOptions.maxValue}`);
    });

    test.each([
      [1, 'to max', 2, 'max', 90, 100, 646, 664, '95%'],
      [2, 'from max to penultimate', 1, 'penultimate', 90, 100, 680, 662, '100%'],
      [1, 'to penultimate', 2, 'penultimate', 80, 90, 612, 650, '90%'],
    ])(
      'shouldn\'t move thumb%i by pointermove %s position if thumb%i is on %s position',
      async (
        activeThumb,
        direction,
        passiveThumb,
        passivePosition,
        value1,
        value2,
        startPoint,
        endPoint,
        activePosition,
      ) => {
        $sliderInstance = $sliderContainer.sliderPlugin({
          value1, value2, isInterval: true, isVertical,
        });
        const [controlContainer] = $sliderInstance.find('.slider__control-container');
        const [movedThumb] = $sliderInstance.find(`.slider__thumb_${activeThumb}`);
        definePropertiesForControlContainer(controlContainer, offsetDimension);
        expect.assertions(2);
        expect(controlContainer.style.getPropertyValue(`--value-${activeThumb}-position`))
          .toBe(activePosition);

        makePointerdown(controlContainer, offsetAxis, startPoint, false, movedThumb);
        await makePointermove(controlContainer, offsetAxis, startPoint, endPoint);

        expect(controlContainer.style.getPropertyValue(`--value-${activeThumb}-position`))
          .toBe(activePosition);
      },
    );
  });
});
