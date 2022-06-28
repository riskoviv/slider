import $ from 'jquery';
import Panel from '../Panel';
import '../slider-plugin';
import { getFractionalPartSize } from '../utils';
import './mocks/ResizeObserver';

describe('Panel', () => {
  const $sliderContainer = $('<div class="slider-container"></div>');
  const changeEvent = new InputEvent('change');
  const inputEvent = new InputEvent('input');
  let $sliderInstance: JQuery<HTMLElement>;
  let panel: Panel;
  let $panelElement: JQuery<HTMLElement>;

  describe('initialized w/ default options', () => {
    beforeEach(() => {
      $sliderInstance = $sliderContainer.sliderPlugin();
      panel = new Panel($sliderInstance);
      $panelElement = $sliderContainer.find('.panel');
    });

    test('if plugin initialized w/ default options, should init Panel w/ all checkboxes unchecked', () => {
      const $panelCheckboxInputs = $panelElement.find('.panel__input_type_checkbox');

      $panelCheckboxInputs.each((idx, elem) => {
        if (elem instanceof HTMLInputElement) {
          expect(elem.checked).toBe(false);
        }
      });
    });

    test('should fill all number inputs based on slider options values', () => {
      const valuesNames: [string, keyof IPluginValueOptions][] = [
        ['from', 'value1'], ['to', 'value2'], ['min', 'minValue'], ['max', 'maxValue'], ['step', 'stepSize'],
      ];
      const sliderOptions = $sliderInstance.getOptions();

      valuesNames.forEach(([role, sliderOption]) => {
        expect(Number($panelElement.find(`.panel__input_type_number[data-role="${role}"]`).val()))
          .toBe(sliderOptions[sliderOption]);
      });
    });

    test('should change every state option after checkbox toggle', () => {
      const $panelCheckboxInputs = $panelElement.find('.panel__input_type_checkbox');
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

      expect(inputChangeEventSpy).toBeCalledTimes(10);
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

      data.forEach(([role, option, value]) => {
        const $panelElem = $panelElement.find(`.panel__input_type_number[data-role="${role}"]`);

        $panelElem.val(value);
        $panelElem[0].dispatchEvent(inputEvent);

        expect($sliderInstance.getOptions()[option]).toBe(value);
      });
    });

    test.each([['min', 84], ['step', 3]])(
      'changing value in %s input should change min/step attr of from and to inputs',
      (bound, value) => {
        const $boundElem = $panelElement.find(`.panel__input_type_number[data-role="${bound}"]`);

        $boundElem.val(value);
        $boundElem[0].dispatchEvent(inputEvent);

        ['from', 'to'].forEach((inputElem) => {
          expect($panelElement.find(`.panel__input_type_number[data-role="${inputElem}"]`).attr(bound)).toBe(`${value}`);
        });
      },
    );

    test.each<[keyof IPluginPublicValueMethods, string, number]>([
      ['setMinValue', 'min', 68], ['setStepSize', 'step', 7.1],
    ])(
      'changing value by %s slider method should change %s attr of from and to inputs',
      (sliderMethod, bound, value) => {
        $sliderInstance[sliderMethod](value);

        ['from', 'to'].forEach((inputElem) => {
          expect($panelElement.find(`.panel__input_type_number[data-role="${inputElem}"]`).attr(bound)).toBe(`${value}`);
        });
      },
    );

    test('if step element value changed, should change bounds inputs step attr according to fractional part size of stepSize', () => {
      const bounds = ['min', 'max', 'step'];
      const stepElem = $panelElement.find('.panel__input_type_number[data-role="step"]');

      [15.3, 7.51, 9.123, 2].forEach((stepSize) => {
        stepElem.val(stepSize);
        stepElem[0].dispatchEvent(inputEvent);

        bounds.forEach((bound) => {
          const boundElem = $panelElement.find(`.panel__input_type_number[data-role="${bound}"]`);
          expect(boundElem.attr('step')).toBe(`${1 / 10 ** getFractionalPartSize(stepSize)}`);
        });
      });
    });

    test('if stepSize changed by setStepSize(), should change bounds inputs step attr according to fractional part size of stepSize', () => {
      const bounds = ['min', 'max', 'step'];

      [3.4, 5.12, 6.321, 1].forEach((stepSize) => {
        $sliderInstance.setStepSize(stepSize);

        bounds.forEach((bound) => {
          const boundElem = $panelElement.find(`.panel__input_type_number[data-role="${bound}"]`);
          expect(boundElem.attr('step')).toBe(`${1 / 10 ** getFractionalPartSize(stepSize)}`);
        });
      });
    });
  });

  describe('initialized w/ custom options', () => {
    test('if plugin initialized w/ all state options as true, should make Panel\'s all checkboxes checked', () => {
      $sliderInstance = $sliderContainer.sliderPlugin({
        isVertical: true, isInterval: true, showProgressBar: true, showScale: true, showTip: true,
      });
      panel = new Panel($sliderInstance);
      $panelElement = $sliderContainer.find('.panel');
      const $panelCheckboxInputs = $panelElement.find('.panel__input_type_checkbox');

      $panelCheckboxInputs.each((idx, elem) => {
        if (elem instanceof HTMLInputElement) {
          expect(elem.checked).toBe(true);
        }
      });
    });

    describe('stepUp() & stepDown() on numeric inputs', () => {
      let stepSize: number;

      beforeAll(() => {
        stepSize = 3.5;
        $sliderInstance = $sliderContainer.sliderPlugin({ stepSize, isInterval: true });
        panel = new Panel($sliderInstance);
        $panelElement = $sliderContainer.find('.panel');
      });

      test.each(['from', 'to'])(
        '"%s" input should do stepped value change by stepSize from slider options',
        (valueInputClass) => {
          const [valueInput] = $panelElement.find(`.panel__input_type_number[data-role="${valueInputClass}"]`);
          if (valueInput instanceof HTMLInputElement) {
            const initialValue = valueInput.valueAsNumber;

            valueInput.stepUp();
            valueInput.dispatchEvent(inputEvent);

            expect(valueInput.valueAsNumber).toBe(initialValue + stepSize);

            valueInput.stepDown();
            valueInput.dispatchEvent(inputEvent);

            expect(valueInput.valueAsNumber).toBe(initialValue);
          }
        },
      );

      test.each(['min', 'max', 'step'])(
        '"%s" input should do stepped value change by stepSize based on stepSize value fractional precision',
        (boundInputClass) => {
          const [boundInput] = $panelElement.find(`.panel__input_type_number[data-role="${boundInputClass}"]`);
          if (boundInput instanceof HTMLInputElement) {
            const initialValue = boundInput.valueAsNumber;

            boundInput.stepUp();
            boundInput.dispatchEvent(inputEvent);

            expect(boundInput.valueAsNumber).toBe(initialValue + 0.1);

            boundInput.stepDown();
            boundInput.dispatchEvent(inputEvent);

            expect(boundInput.valueAsNumber).toBe(initialValue);
          }
        },
      );
    });
  });
});
