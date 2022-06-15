import Model from '../Model';
import { getEntriesWithTypedKeys } from '../utils';

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
let model: Model;

const initModelWithDefaultOptions = () => {
  model = new Model(defaultOptions);
};

describe('Model', () => {
  beforeAll(() => {
    initModelWithDefaultOptions();
  });

  describe('on initialization', () => {
    test('should set options property to equal passed options object by content but not be the same object', () => {
      expect(model.options).toEqual(defaultOptions);
      expect(model.options).not.toBe(defaultOptions);
    });

    test('should set allowedValuesCount to 21', () => {
      expect(model.allowedValuesCount).toBe(21);
    });

    test('should set fractionalPrecision to 0', () => {
      expect(model.fractionalPrecision).toBe(0);
    });

    test('should set penultimateValue to 90', () => {
      expect(model.penultimateValue).toBe(90);
    });

    describe('if one of following options is not integer', () => {
      test.each`
        option        | value      | precision
        ${'stepSize'} | ${10.5}    | ${1}
        ${'minValue'} | ${-100.55} | ${2}
        ${'maxValue'} | ${100.535} | ${3}
      `('if $option is $value, should set fractionalPrecision to $precision', ({ option, value, precision }) => {
        const customModel = new Model({ ...defaultOptions, [option]: value });

        expect(customModel.fractionalPrecision).toBe(precision);
      });
    });

    describe('if isInterval is true', () => {
      describe('and one or two of values is not allowed', () => {
        test.each`
          value                | sourceValues                  | expectedValues
          ${'value1'}          | ${{ value1: -74 }}            | ${[[1, -70]]}
          ${'value2'}          | ${{ value2: 55 }}             | ${[[2, 60]]}
          ${'value1 & value2'} | ${{ value1: -1, value2: 19 }} | ${[[1, 0], [2, 20]]}
        `(
          'should find closest $value that satisfies stepSize',
          ({ sourceValues, expectedValues }) => {
            const customModel = new Model({
              ...defaultOptions,
              isInterval: true,
              ...sourceValues,
            });

            expectedValues.forEach(([number, value]: [1 | 2, number]) => {
              expect(customModel.options[`value${number}`]).toBe(value);
            });
          },
        );
      });

      describe('and both value1 & value2 === maxValue', () => {
        test('should set value1 to penultimate value if maxValue satisfies stepSize', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: defaultOptions.maxValue,
            value2: defaultOptions.maxValue,
          });

          expect(customModel.options.value1).toBe(90);
          expect(customModel.options.value2).toBe(defaultOptions.maxValue);
        });

        test('should set value1 to penultimate value if maxValue not satisfies stepSize', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            stepSize: 3,
            value1: defaultOptions.maxValue,
            value2: defaultOptions.maxValue,
          });

          expect(customModel.options.value1).toBe(98);
          expect(customModel.options.value2).toBe(defaultOptions.maxValue);
        });
      });

      test.each`
        source      | result      | relation | resultDescription
        ${[10, 10]} | ${[10, 20]} | ${'==='} | ${'set value2 as next after value1'}
        ${[40, 30]} | ${[30, 40]} | ${'>'}   | ${'swap values'}
      `(
        'if value1 $relation value2, should $resultDescription',
        ({ source, result }) => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: source[0],
            value2: source[1],
          });

          expect(customModel.options.value1).toBe(result[0]);
          expect(customModel.options.value2).toBe(result[1]);
        },
      );
    });
  });

  test('getOptions returns the same object as defaultOptions (by content)', () => {
    const modelOptions = model.getOptions();

    expect(modelOptions).toEqual(defaultOptions);
    expect(modelOptions).not.toBe(model.options);
  });

  test('getStateOptions returns the same state options as they were passed on init', () => {
    const stateOptions: IPluginStateOptions = {
      isInterval: defaultOptions.isInterval,
      isVertical: defaultOptions.isVertical,
      showTip: defaultOptions.showTip,
      showScale: defaultOptions.showScale,
      showProgressBar: defaultOptions.showProgressBar,
    };

    const modelStateOptions = model.getStateOptions();

    expect(modelStateOptions).toEqual(stateOptions);
  });

  describe('getIndexByValueNumber(valueNumber: 1 | 2)', () => {
    test.each<[1 | 2, number]>([
      [1, 5],
      [2, 15],
    ])('returns index of value%i: %i', (number, index) => {
      expect(model.getIndexByValueNumber(number)).toBe(index);
    });

    test('should return index of value2 === maxValue that is 20', () => {
      model.options.value2 = defaultOptions.maxValue;

      expect(model.getIndexByValueNumber(2)).toBe(20);
    });
  });

  describe('getIndexByValue(value: number) returns index of value from range considering step', () => {
    test.each([
      [-100, 0],
      [-90, 1],
      [-50, 5],
      [defaultOptions.maxValue, 20],
    ])('if value is %i, returns %i', (value, index) => {
      expect(model.getIndexByValue(value)).toBe(index);
    });
  });

  describe('getValueByIndex() returns value from range by index of that value', () => {
    test.each([
      [0, -100],
      [1, -90],
    ])('if index is %i, return %i', (index, value) => {
      expect(model.getValueByIndex(index)).toBe(value);
    });
  });

  describe('API methods', () => {
    describe('setStepSize(stepSize: number) set or don\t set values as stepSize option:', () => {
      const stepSizeChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on('stepSizeChanged', stepSizeChangedSpy);
      });

      test('should set positive integer that is less than range', () => {
        model.setStepSize(20);

        expect(model.options.stepSize).toBe(20);
        expect(stepSizeChangedSpy).toBeCalled();
      });

      test('should set positive float that is less than range', () => {
        model.setStepSize(15.5);

        expect(model.options.stepSize).toBeCloseTo(15.5);
        expect(stepSizeChangedSpy).toBeCalled();
      });

      test('shouldn\'t allow to set any negative value and set absolute value of it instead', () => {
        const negativeStepSize = -20;

        model.setStepSize(negativeStepSize);

        expect(model.options.stepSize).toBe(-negativeStepSize);
        expect(stepSizeChangedSpy).toBeCalled();
      });

      test('shouldn\'t allow to set value that is more than range', () => {
        const currentStepSize = model.options.stepSize;
        const range = model.options.maxValue - model.options.minValue;
        const stepMoreThanRange = range + 10;

        model.setStepSize(stepMoreThanRange);

        expect(model.options.stepSize).toBe(currentStepSize);
        expect(model.options.stepSize).not.toBe(stepMoreThanRange);
        expect(stepSizeChangedSpy).not.toBeCalled();
      });

      test('should not set any non-finite value', () => {
        const currentStepSize = model.options.stepSize;

        [0, NaN, -Infinity, Infinity].forEach((value) => model.setStepSize(value));

        expect(model.options.stepSize).toBe(currentStepSize);
        expect(stepSizeChangedSpy).not.toBeCalled();
      });
    });

    describe('setValue() sets new 1st or 2nd value considering stepSize and correcting it if it\'s not satisfies stepSize', () => {
      const valueChangedSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on('valueChanged', valueChangedSpy);
      });

      afterEach(() => {
        model.off('valueChanged', valueChangedSpy);
      });

      test('should set 1st value to 0', () => {
        model.setValue(1, 0);

        expect(model.options.value1).toBe(0);
        expect(valueChangedSpy).toBeCalled();
      });

      test('should set 2nd value to -40 (don\'t consider value1)', () => {
        model.setValue(2, -40);

        expect(model.options.value2).toBe(-40);
        expect(valueChangedSpy).toBeCalled();
      });

      test.each`
        valueName     | condition   | limitValue                 | passedValue
        ${'minValue'} | ${'<'}      | ${defaultOptions.minValue} | ${-1}
        ${'maxValue'} | ${'>'}      | ${defaultOptions.maxValue} | ${1}
      `('should set value1 to $valueName if passed value $condition $valueName', ({
        limitValue, passedValue,
      }) => {
        model.setValue(1, limitValue + passedValue);

        expect(model.options.value1).toBe(limitValue);
        expect(valueChangedSpy).toBeCalled();
      });

      test.each`
        valueName     | value
        ${'minValue'} | ${defaultOptions.minValue}
        ${'maxValue'} | ${defaultOptions.maxValue}
      `('should set value1 to $valueName if passed value === $valueName', ({ value }) => {
        model.setValue(1, value);

        expect(model.options.value1).toBe(value);
        expect(valueChangedSpy).toBeCalled();
      });

      describe('if isInterval is true, setValue() should consider value1 or value2', () => {
        let customModel: Model;

        beforeAll(() => {
          customModel = new Model({ ...defaultOptions, isInterval: true });
          customModel.on('valueChanged', valueChangedSpy);
        });

        afterAll(() => {
          customModel.off('valueChanged', valueChangedSpy);
        });

        test.each<{
          primaryValue: { number: 1 | 2, value: number },
          secondaryValue: { number: 1 | 2, sourceValue: number, resultValue: number },
          valueChange: { side: string, result: string },
        }>([
          {
            primaryValue: { number: 1, value: 0 },
            secondaryValue: { number: 2, sourceValue: -10, resultValue: 10 },
            valueChange: { side: 'less than', result: 'value1 + stepSize' },
          },
          {
            primaryValue: { number: 2, value: 20 },
            secondaryValue: { number: 1, sourceValue: 25, resultValue: 10 },
            valueChange: { side: 'more than', result: 'value2 - stepSize' },
          },
          {
            primaryValue: { number: 2, value: defaultOptions.maxValue },
            secondaryValue: {
              number: 1,
              sourceValue: defaultOptions.maxValue,
              resultValue: 90,
            },
            valueChange: {
              side: 'more or equal to maxValue that set to',
              result: 'penultimate value',
            },
          },
        ])(
          'if value$secondaryValue.number intent to set to $valueChange.side value$primaryValue.number, set value$secondaryValue.number to $valueChange.result',
          ({ primaryValue, secondaryValue }) => {
            customModel.setValue(primaryValue.number, primaryValue.value);
            customModel.setValue(secondaryValue.number, secondaryValue.sourceValue);

            expect(customModel.options[`value${primaryValue.number}`])
              .toBe(primaryValue.value);
            expect(customModel.options[`value${secondaryValue.number}`])
              .toBe(secondaryValue.resultValue);
            expect(valueChangedSpy).toBeCalledTimes(2);
          },
        );
      });
    });

    describe('setVerticalState()', () => {
      const isVerticalChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on('isVerticalChanged', isVerticalChangedSpy);
      });

      test.each([
        ['enable', true],
        ['disable', false],
      ])('should %s isVertical if %s passed', (state, booleanValue) => {
        model.setVerticalState(booleanValue);

        expect(model.options.isVertical).toBe(booleanValue);
        expect(isVerticalChangedSpy).toBeCalled();
      });
    });

    describe('setInterval()', () => {
      const isIntervalChangedSpy = jest.fn();
      const valueChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on('isIntervalChanged', isIntervalChangedSpy);
        model.on('valueChanged', valueChangedSpy);
      });

      test.each([
        ['enable', true],
        ['disable', false],
      ])('if values were not fixed by fixValues(), should %s isInterval and emit valueChanged only if isInterval is changed to true and position[2] was NaN before enabling isInterval', (state, booleanValue) => {
        const valueChangedCallsCount = booleanValue && Number.isNaN(model.viewValues.positions[2])
          ? 1 : 0;
        model.setInterval(booleanValue);

        expect(model.options.isInterval).toBe(booleanValue);
        expect(isIntervalChangedSpy).toBeCalled();
        expect(valueChangedSpy).toBeCalledTimes(valueChangedCallsCount);
      });

      test.each<[string, [number, number], { value1?: number, value2?: number }]>([
        ['value1', [defaultOptions.maxValue, defaultOptions.maxValue], { value1: 90 }],
        ['value2', [defaultOptions.minValue, defaultOptions.minValue], { value2: -90 }],
        ['value1 & value2', [10, -10], { value1: -10, value2: 10 }],
      ])(
        'should emit valueChanged if %s was changed in fixValues()',
        (valuesNames, [value1, value2], resultValues) => {
          const customModel = new Model({
            ...defaultOptions,
            value1,
            value2,
          });
          customModel.on('isIntervalChanged', isIntervalChangedSpy);
          customModel.on('valueChanged', valueChangedSpy);

          customModel.setInterval(true);

          expect(isIntervalChangedSpy).toBeCalled();
          getEntriesWithTypedKeys(resultValues).forEach(([valueName, value], index) => {
            expect(customModel.options[valueName]).toBe(value);
            const number = Number(valueName.slice(-1));
            const changeTipValue = number === 1;
            expect(valueChangedSpy.mock.calls[index])
              .toContainEqual({ number, value, changeTipValue });
          });
        },
      );
    });

    describe('setShowProgress()', () => {
      const showProgressChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on('showProgressChanged', showProgressChangedSpy);
      });

      test.each([['enable', true], ['disable', false]])(
        'should %s progressBar if %s passed',
        (state, booleanValue) => {
        model.setShowProgress(booleanValue);

          expect(showProgressChangedSpy).toBeCalled();
        expect(model.options.showProgressBar).toBe(booleanValue);
        },
      );
    });
      });
    });

    describe('should not emit their events if the value passed on call is the same as already set', () => {
      beforeAll(() => {
        initModelWithDefaultOptions();
      });

      test('none of methods should emit event and no listeners should be called', () => {
        const listeners: jest.Mock[] = [];
        const eventNames: EventName[] = [
          'stepSizeChanged',
          'valueChanged',
          'isVerticalChanged',
          'isIntervalChanged',
          'showProgressChanged',
        ];
        eventNames.forEach((eventName) => {
          const listener = jest.fn();
          model.on(eventName, listener);
          listeners.push(listener);
        });

        model.setStepSize(10);
        model.setValue(1, -50);
        model.setVerticalState(false);
        model.setInterval(false);
        model.setShowProgress(false);

        listeners.forEach((listener) => {
          expect(listener).not.toBeCalled();
        });
      });
    });
  });
});
