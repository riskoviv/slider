/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import Panel from '../Panel';
import '../slider-plugin';
import { defaultOptions, getFractionalPartSize } from '../utils';
import './mocks/ResizeObserver';

describe('Panel', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  const changeEvent = new InputEvent('change');
  const inputEvent = new InputEvent('input');
  let $sliderInstance: JQuery<HTMLElement>;
  let panel: Panel;
  let $panelElement: JQuery<HTMLElement>;

  beforeEach(() => {
    Object.defineProperties($sliderContainer[0], {
      offsetWidth: { value: 700 },
      offsetHeight: { value: 700 },
    });
    $sliderInstance = $sliderContainer.sliderPlugin();
    panel = new Panel($sliderInstance);
    $panelElement = $sliderContainer.find('.panel');
  });

  test('if plugin initialized w/ default options, should init Panel w/ all checkboxes unchecked', () => {
    const $panelCheckboxInputs = $panelElement.find('input[type="checkbox"]');

    $panelCheckboxInputs.each((idx, elem) => {
      if (elem instanceof HTMLInputElement) {
        expect(elem.checked).toBe(false);
      }
    });
  });

  test('if plugin initialized w/ all state options as true, should make Panel\'s all checkboxes checked', () => {
    $sliderInstance = $sliderContainer.sliderPlugin({
      isVertical: true, isInterval: true, showProgressBar: true, showScale: true, showTip: true,
    });
    panel = new Panel($sliderInstance);
    $panelElement = $sliderContainer.find('.panel');
    const $panelCheckboxInputs = $panelElement.find('input[type="checkbox"]');

    $panelCheckboxInputs.each((idx, elem) => {
      if (elem instanceof HTMLInputElement) {
        expect(elem.checked).toBe(true);
      }
    });
  });

  test('should change every state option after checkbox toggle', () => {
    const $panelCheckboxInputs = $panelElement.find('input[type="checkbox"]');
    const inputChangeEventSpy = jest.fn();

    $panelCheckboxInputs.each((idx, elem) => {
      if (elem instanceof HTMLInputElement) {
        elem.addEventListener('change', inputChangeEventSpy);
        // eslint-disable-next-line no-param-reassign
        elem.checked = true;
        elem.dispatchEvent(changeEvent);
        expect(elem.checked).toBe(true);
      }
    });

    expect(inputChangeEventSpy).toBeCalledTimes(5);
    const sliderOptions = $sliderInstance.getOptions();
    const sliderStateOptions: (keyof IPluginStateOptions)[] = ['isVertical', 'isInterval', 'showProgressBar', 'showScale', 'showTip'];
    sliderStateOptions.forEach((stateOption) => {
      expect(sliderOptions[stateOption]).toBe(true);
    });
  });

  test('should change every numeric option of slider if numeric Panel element\'s value is changed', () => {
    const data: [string, keyof IPluginValueOptions, number][] = [
      ['from', 'value1', -30],
      ['to', 'value2', 70],
      ['min', 'minValue', -40],
      ['max', 'maxValue', 50],
      ['step', 'stepSize', 13],
    ];
    data.forEach(([elemClass, option, value]) => {
      const $panelElem = $panelElement.find(`input[class$="${elemClass}"]`);
      $panelElem.val(value);
      $panelElem[0].dispatchEvent(inputEvent);
      expect($sliderInstance.getOptions()[option]).toBe(value);
    });
  });

  test.each([['min', 84], ['step', 3]])(
    'changing value in %s input should change %s attr of from and to inputs',
    (constraint, value) => {
      const $elem: JQuery<HTMLElement> = $panelElement.find(`input[class$="${constraint}"]`);
      $elem.val(value);
      $elem[0].dispatchEvent(inputEvent);
      ['from', 'to'].forEach((inputElem) => {
        expect($panelElement.find(`input[class$="${inputElem}"]`).attr(constraint)).toBe(`${value}`);
      });
    },
  );

  test.each([15.3, 7.51, 9.123, 2])(
    'should change constraints inputs step attr according to fractional part size of step input',
    (stepSize) => {
      const constraints = ['min', 'max', 'step'];
      const stepElem = $panelElement.find('input[class$="step"]');
      stepElem.val(stepSize);
      stepElem[0].dispatchEvent(inputEvent);
      constraints.forEach((constraint) => {
        const constraintElem = $panelElement.find(`input[class$="${constraint}"]`);
        expect(constraintElem.attr('step')).toBe(`${1 / 10 ** getFractionalPartSize(stepSize)}`);
      });
    },
  );
});
