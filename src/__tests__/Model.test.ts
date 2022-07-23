import Model from '../Model';
import { getEntriesWithTypedKeys, defaultOptions, invalidValues } from '../utils';

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
    describe('setValue1|2() sets new 1st or 2nd value considering stepSize and correcting it if it\'s not satisfies stepSize', () => {
      const value1ChangedSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'value1Changed', handler: value1ChangedSpy });
      });

      test('should not set any non-finite number and non-number value', () => {
        const value2ChangedSpy = jest.fn();
        model.on({ event: 'value2Changed', handler: value2ChangedSpy });
        const currentValue1 = model.options.value1;
        const currentValue2 = model.options.value2;

        invalidValues.forEach((value: any) => {
          model.setValue1(value);
          model.setValue2(value);
        });

        expect(model.options.value1).toBe(currentValue1);
        expect(model.options.value2).toBe(currentValue2);
        expect(value1ChangedSpy).not.toBeCalled();
        expect(value2ChangedSpy).not.toBeCalled();
      });

      test('should set 1st value to 0', () => {
        model.setValue1(0);

        expect(model.options.value1).toBe(0);
        expect(value1ChangedSpy).toBeCalled();
      });

      test('should set 2nd value to -40 (don\'t consider value1)', () => {
        const value2ChangedSpy = jest.fn();
        model.on({ event: 'value2Changed', handler: value2ChangedSpy });
        model.setValue2(-40);

        expect(model.options.value2).toBe(-40);
        expect(value2ChangedSpy).toBeCalled();
      });

      test.each`
        valueName     | condition   | limitValue                 | passedValue
        ${'minValue'} | ${'<'}      | ${defaultOptions.minValue} | ${-1}
        ${'maxValue'} | ${'>'}      | ${defaultOptions.maxValue} | ${1}
      `('should set value1 to $valueName if passed value $condition $valueName', ({
        limitValue, passedValue,
      }) => {
        model.setValue1(limitValue + passedValue);

        expect(model.options.value1).toBe(limitValue);
        expect(value1ChangedSpy).toBeCalled();
      });

      test.each`
        valueName     | value
        ${'minValue'} | ${defaultOptions.minValue}
        ${'maxValue'} | ${defaultOptions.maxValue}
      `('should set value1 to $valueName if passed value === $valueName', ({ value }) => {
        model.setValue1(value);

        expect(model.options.value1).toBe(value);
        expect(value1ChangedSpy).toBeCalled();
      });

      describe('if isInterval is true, setValue1|2() should consider value1 or value2', () => {
        const value2ChangedSpy = jest.fn();
        let customModel: Model;

        beforeEach(() => {
          customModel = new Model({ ...defaultOptions, isInterval: true });
          customModel.on({ event: 'value1Changed', handler: value1ChangedSpy })
            .on({ event: 'value2Changed', handler: value2ChangedSpy });
        });

        test.each<{
          primaryValue: { number: 1 | 2, value: number },
          secondaryValue: { number: 1 | 2, sourceValue: number, resultValue: number },
          valueChange: { side: string, result: string },
        }>([
          {
            primaryValue: { number: 2, value: 20 },
            secondaryValue: { number: 1, sourceValue: 20, resultValue: 10 },
            valueChange: { side: 'equal to', result: 'value2 - stepSize' },
          },
          {
            primaryValue: { number: 1, value: -30 },
            secondaryValue: { number: 2, sourceValue: -30, resultValue: -20 },
            valueChange: { side: 'equal to', result: 'value1 + stepSize' },
          },
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
            customModel[`setValue${primaryValue.number}`](primaryValue.value);
            customModel[`setValue${secondaryValue.number}`](secondaryValue.sourceValue);

            expect(customModel.options[`value${primaryValue.number}`])
              .toBe(primaryValue.value);
            expect(customModel.options[`value${secondaryValue.number}`])
              .toBe(secondaryValue.resultValue);
            expect(value1ChangedSpy).toBeCalledTimes(1);
            expect(value2ChangedSpy).toBeCalledTimes(1);
          },
        );
      });
    });

    describe('setVerticalState()', () => {
      const isVerticalChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'isVerticalChanged', handler: isVerticalChangedSpy });
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
      const value1ChangedSpy = jest.fn();
      const value2ChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'isIntervalChanged', handler: isIntervalChangedSpy });
        model.on({ event: 'value1Changed', handler: value1ChangedSpy })
          .on({ event: 'value2Changed', handler: value2ChangedSpy });
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
        expect(value1ChangedSpy).not.toBeCalled();
        expect(value2ChangedSpy).toBeCalledTimes(valueChangedCallsCount);
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
          customModel.on({ event: 'isIntervalChanged', handler: isIntervalChangedSpy })
            .on({ event: 'value1Changed', handler: value1ChangedSpy })
            .on({ event: 'value2Changed', handler: value2ChangedSpy });

          customModel.setInterval(true);

          expect(isIntervalChangedSpy).toBeCalled();
          getEntriesWithTypedKeys(resultValues).forEach(([valueName, value]) => {
            expect(customModel.options[valueName]).toBe(value);
            const number = Number(valueName.slice(-1));
            const changeTipValue = number === 1;
            if (number === 1) {
              expect(value1ChangedSpy).toBeCalledWith(value, {
                changeTipValue, checkTipsOverlap: false,
              });
            } else {
              expect(value2ChangedSpy).toBeCalledWith(value, {
                changeTipValue, checkTipsOverlap: true,
              });
            }
          });
        },
      );
    });

    describe('setShowProgress()', () => {
      const showProgressChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'showProgressChanged', handler: showProgressChangedSpy });
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

    describe('setShowTip()', () => {
      const showTipChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'showTipChanged', handler: showTipChangedSpy });
      });

      test.each([['add', true], ['remove', false]])(
        'should %s tip(s) if passed %s',
        (action, boolean) => {
          model.setShowTip(boolean);

          expect(showTipChangedSpy).toBeCalled();
          expect(model.options.showTip).toBe(boolean);
        },
      );
    });

    describe('setShowScale()', () => {
      const showScaleChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'showScaleChanged', handler: showScaleChangedSpy });
      });

      test.each([['add', true], ['remove', false]])(
        'should %s scale if passed %s',
        (action, boolean) => {
          model.setShowScale(boolean);

          expect(showScaleChangedSpy).toBeCalled();
          expect(model.options.showScale).toBe(boolean);
        },
      );
    });

    describe('setStepSize(stepSize: number) set or don\'t set values as stepSize option:', () => {
      const stepSizeChangedSpy = jest.fn();
      const value1ChangedSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'stepSizeChanged', handler: stepSizeChangedSpy })
          .on({ event: 'value1Changed', handler: value1ChangedSpy });
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

      test('should not set any non-finite, non-number value and 0', () => {
        const currentStepSize = model.options.stepSize;

        [0, ...invalidValues].forEach((value: any) => model.setStepSize(value));

        expect(model.options.stepSize).toBe(currentStepSize);
        expect(stepSizeChangedSpy).not.toBeCalled();
      });

      test('if isInterval: true, should update fractionalPrecision & change value1 & value2 according to new stepSize & fractionalPrecision', () => {
        const customModel = new Model({ ...defaultOptions, isInterval: true });
        const value2ChangedSpy = jest.fn();
        customModel.on({ event: 'value1Changed', handler: value1ChangedSpy })
          .on({ event: 'value2Changed', handler: value2ChangedSpy })
          .on({ event: 'stepSizeChanged', handler: stepSizeChangedSpy });
        expect(customModel.options.value1).toBe(-50);
        expect(customModel.options.value2).toBe(50);

        customModel.setStepSize(4.12);

        expect(stepSizeChangedSpy).toBeCalled();
        expect(value1ChangedSpy).toBeCalled();
        expect(value2ChangedSpy).toBeCalled();
        expect(customModel.fractionalPrecision).toBe(2);
        expect(customModel.options.value1).toBe(-50.56);
        expect(customModel.options.value2).toBe(48.32);
      });
    });

    describe('setMinValue() should set new minValue, emit minValueChanged & valueChanged', () => {
      const minValueChangedSpy = jest.fn();
      const value1ChangedSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'minValueChanged', handler: minValueChangedSpy })
          .on({ event: 'value1Changed', handler: value1ChangedSpy });
      });

      test.each([-85, 25.3, 2])(
        `should set new minValue (%d) if it is less than maxValue (${defaultOptions.maxValue})`,
        (minValue) => {
          model.setMinValue(minValue);

          expect(model.options.minValue).toBe(minValue);
          expect(minValueChangedSpy).toBeCalled();
          expect(value1ChangedSpy).toBeCalled();
        },
      );

      test('should not set new minValue if it is more than maxValue or is not finite number or not a number', () => {
        [123, ...invalidValues].forEach((minValue: any) => {
          model.setMinValue(minValue);
        });

        expect(model.options.minValue).toBe(defaultOptions.minValue);
        expect(minValueChangedSpy).not.toBeCalled();
        expect(value1ChangedSpy).not.toBeCalled();
      });

      test('if new minValue === maxValue, should set maxValue to new minValue + stepSize and save minValue', () => {
        model.setMinValue(defaultOptions.maxValue);

        expect(model.options.minValue).toBe(defaultOptions.maxValue);
        expect(model.options.maxValue).toBe(defaultOptions.maxValue + model.options.stepSize);
      });
    });

    describe('setMaxValue() should set new maxValue, emit maxValueChanged & valueChanged', () => {
      const maxValueChangedSpy = jest.fn();
      const value1ChangedSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on({ event: 'maxValueChanged', handler: maxValueChangedSpy })
          .on({ event: 'value1Changed', handler: value1ChangedSpy });
      });

      test.each([64, 0, -51])(
        `should set new maxValue to %i if it is more than minValue (${defaultOptions.minValue})`,
        (maxValue) => {
          model.setMaxValue(maxValue);

          expect(model.options.maxValue).toBe(maxValue);
          expect(maxValueChangedSpy).toBeCalled();
          if (maxValue < defaultOptions.value1) {
            expect(model.getOptions().value1).toBe(maxValue);
          }
          expect(value1ChangedSpy).toBeCalled();
        },
      );

      test('should not set new maxValue if it is less than minValue or is not finite number or not a number', () => {
        [-105, ...invalidValues].forEach((maxValue: any) => {
          model.setMaxValue(maxValue);
        });

        expect(model.options.maxValue).toBe(defaultOptions.maxValue);
        expect(maxValueChangedSpy).not.toBeCalled();
        expect(value1ChangedSpy).not.toBeCalled();
      });

      test('if new maxValue === minValue, should set maxValue to minValue + stepSize', () => {
        model.setMaxValue(defaultOptions.minValue);

        expect(model.options.maxValue).toBe(defaultOptions.minValue + defaultOptions.stepSize);
      });
    });

    describe('should not emit their events and no listeners should be called, just return and do nothing', () => {
      beforeEach(() => {
        initModelWithDefaultOptions();
      });

      test('if the value passed on call is the same as already set', () => {
        const listeners: jest.Mock[] = [];
        const eventNames: ModelEvent[] = [
          'value1Changed',
          'value2Changed',
          'isVerticalChanged',
          'isIntervalChanged',
          'showProgressChanged',
          'showTipChanged',
          'showScaleChanged',
          'stepSizeChanged',
          'minValueChanged',
          'maxValueChanged',
        ];
        eventNames.forEach((eventName) => {
          const listener = jest.fn();
          model.on({ event: eventName, handler: listener });
          listeners.push(listener);
        });

        model.setValue1(-50);
        model.setValue2(50);
        model.setVerticalState(false);
        model.setInterval(false);
        model.setShowProgress(false);
        model.setShowTip(false);
        model.setShowScale(false);
        model.setStepSize(10);
        model.setMinValue(-100);
        model.setMaxValue(100);

        listeners.forEach((listener) => {
          expect(listener).not.toBeCalled();
        });
      });

      test('if argument passed to every state method has wrong type', () => {
        const listeners: jest.Mock[] = [];
        const eventNames: StateEvent[] = [
          'isVerticalChanged',
          'isIntervalChanged',
          'showProgressChanged',
          'showTipChanged',
          'showScaleChanged',
        ];
        eventNames.forEach((eventName) => {
          const listener = jest.fn();
          model.on({ event: eventName, handler: listener });
          listeners.push(listener);
        });
        const stateMethods: (keyof ModelStateMethods)[] = [
          'setVerticalState',
          'setInterval',
          'setShowProgress',
          'setShowTip',
          'setShowScale',
        ];
        const nonBoolean: any = 49;

        stateMethods.forEach((method) => {
          model[method](nonBoolean);
        });

        listeners.forEach((listener) => {
          expect(listener).not.toBeCalled();
        });
        expect(model.getOptions()).toEqual(defaultOptions);
      });
    });

    describe('subscribe() receives an HTMLInputElement or callback function. If it is an HTMLInputElement, depending on its type (checkbox or number) makes a function that will be called when event w/ received name is emitted', () => {
      let isUnsubscribed: boolean;

      beforeEach(() => {
        initModelWithDefaultOptions();
        isUnsubscribed = false;
      });

      test.concurrent.each`
        inputType     | event                  | inputProperty      | value1  | value2   | method
        ${'number'}   | ${'value1Changed'}     | ${'valueAsNumber'} | ${20}   | ${30}    | ${'setValue1'}
        ${'number'}   | ${'stepSizeChanged'}   | ${'valueAsNumber'} | ${2}    | ${6}     | ${'setStepSize'}
        ${'checkbox'} | ${'isIntervalChanged'} | ${'checked'}       | ${true} | ${false} | ${'setInterval'}
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
          const inputElement: UnsubHTMLInputElement = document.createElement('input');
          inputElement.type = inputType;
          model.subscribe({ event, subscriber: inputElement });

          switch (inputType) {
            case 'number':
              model[method](value1);
              break;
            case 'checkbox':
              model[method](value1);
              break;
            default: break;
          }

          expect(inputElement[inputProperty]).toBe(value1);

          if (Math.round(Math.random())) isUnsubscribed = model.unsubscribe(inputElement);
          else if (inputElement.unsubscribe) isUnsubscribed = inputElement.unsubscribe();

          expect(isUnsubscribed).toBe(true);

          switch (inputType) {
            case 'number':
              model[method](value2);
              break;
            case 'checkbox':
              model[method](value2);
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
            const callback: Callback<typeof value1> = (value: typeof value1) => {
              variableChangedByCallback = value;
            };
            model.subscribe({ event, subscriber: callback });

            switch (event) {
              case 'value1Changed':
                model[method](value1);
                break;
              case 'showProgressChanged':
                model[method](value1);
                break;
              default:
                break;
            }

            expect(variableChangedByCallback).toBe(value1);

            if (Math.round(Math.random())) isUnsubscribed = model.unsubscribe(callback);
            else if (callback.unsubscribe) isUnsubscribed = callback.unsubscribe();

            switch (event) {
              case 'value1Changed':
                model[method](value2);
                break;
              case 'showProgressChanged':
                model[method](value2);
                break;
              default:
                break;
            }

            expect(isUnsubscribed).toBe(true);
            expect(variableChangedByCallback).toBe(value1);
          },
        );
      });
    });

    test('unsubscribe() should return false if received value is other than HTMLInputElement or Function', () => {
      initModelWithDefaultOptions();
      const notUnsubscribable: any = { test: true };
      expect(model.unsubscribe(notUnsubscribable)).toBe(false);
    });

    test('should throw error on emit when event is not registered and has no listeners', () => {
      initModelWithDefaultOptions();
      const stateMethods: [keyof ModelStateMethods, StateEvent][] = [
        ['setVerticalState', 'isVerticalChanged'],
        ['setInterval', 'isIntervalChanged'],
        ['setShowProgress', 'showProgressChanged'],
        ['setShowTip', 'showTipChanged'],
        ['setShowScale', 'showScaleChanged'],
      ];
      const valueMethods: [keyof ModelValueMethods, ValueEvent][] = [
        ['setValue1', 'value1Changed'],
        ['setValue2', 'value2Changed'],
        ['setStepSize', 'stepSizeChanged'],
        ['setMinValue', 'minValueChanged'],
        ['setMaxValue', 'maxValueChanged'],
      ];
      jest.spyOn(console, 'error');
      const mockConsoleError = console.error as jest.MockedFunction<typeof console.error>;
      const emitError = new Error();
      emitError.name = 'EmitError';

      stateMethods.forEach(([stateMethod, stateEvent]) => {
        model[stateMethod](true);
        emitError.message = `${stateEvent} event is not registered. arg = true`;
        expect(mockConsoleError.mock.calls).toContainEqual([emitError]);
      });

      mockConsoleError.mockClear();
      let numberValue = 10;
      valueMethods.forEach(([valueMethod, valueEvent]) => {
        model[valueMethod](numberValue);
        emitError.message = `${valueEvent} event is not registered. arg = ${numberValue}`;
        expect(mockConsoleError.mock.calls).toContainEqual([emitError]);
        numberValue += 10;
      });
    });
  });
});
