import Model from './Model';

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
      expect(model.allowedValuesCount).toEqual(21);
    });

    test('should set fractionalPrecision to 0', () => {
      expect(model.fractionalPrecision).toEqual(0);
    });

    test('should set penultimateValue to 90', () => {
      expect(model.penultimateValue).toEqual(90);
    });

    describe('if one of following options is not integer', () => {
      test.each`
        option        | value      | precision
        ${'stepSize'} | ${10.5}    | ${1}
        ${'minValue'} | ${-100.55} | ${2}
        ${'maxValue'} | ${100.535} | ${3}
      `('if $option is $value, should set fractionalPrecision to $precision', ({ option, value, precision }) => {
        const customModel = new Model({ ...defaultOptions, [option]: value });

        expect(customModel.fractionalPrecision).toEqual(precision);
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
              expect(customModel.options[`value${number}`]).toEqual(value);
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

          expect(customModel.options.value1).toEqual(90);
          expect(customModel.options.value2).toEqual(defaultOptions.maxValue);
        });

        test('should set value1 to penultimate value if maxValue not satisfies stepSize', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            stepSize: 3,
            value1: defaultOptions.maxValue,
            value2: defaultOptions.maxValue,
          });

          expect(customModel.options.value1).toEqual(98);
          expect(customModel.options.value2).toEqual(defaultOptions.maxValue);
        });
      });

      describe('and both value1 & value2 === minValue', () => {
        test('should set value2 to second value', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: defaultOptions.minValue,
            value2: defaultOptions.minValue,
          });

          expect(customModel.options.value1).toEqual(defaultOptions.minValue);
          expect(customModel.options.value2)
            .toEqual(defaultOptions.minValue + defaultOptions.stepSize);
        });
      });

      describe('and value1 === value2', () => {
        test('should set value2 = value1 + stepSize', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: 10,
            value2: 10,
          });

          expect(customModel.options.value1).toEqual(10);
          expect(customModel.options.value2).toEqual(20);
        });
      });

      describe('and value2 < value1 and value1 === maxValue', () => {
        test('if value1 is maxValue & value2 is minValue, should swap them', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: defaultOptions.maxValue,
            value2: defaultOptions.minValue,
          });

          expect(customModel.options.value1).toEqual(defaultOptions.minValue);
          expect(customModel.options.value2).toEqual(defaultOptions.maxValue);
        });
      });

      describe('and value2 < value1', () => {
        test('should swap values', () => {
          const customModel = new Model({
            ...defaultOptions,
            isInterval: true,
            value1: 40,
            value2: 30,
          });

          expect(customModel.options.value1).toEqual(30);
          expect(customModel.options.value2).toEqual(40);
        });
      });
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
  });

  describe('getIndexByValue(value: number) returns index of value from range considering step', () => {
    test.each([
      [-100, 0],
      [-90, 1],
      [-50, 5],
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

  describe('setStepSize(stepSize: number) set or don\t set values as stepSize option:', () => {
    const stepSizeChangedSpy = jest.fn();

    beforeAll(() => {
      initModelWithDefaultOptions();
      model.on('stepSizeChanged', stepSizeChangedSpy);
    });

    test('should set positive integer that is less than range', () => {
      model.setStepSize(20);

      expect(model.options.stepSize).toEqual(20);
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

      expect(model.options.stepSize).toEqual(-negativeStepSize);
      expect(model.options.stepSize).not.toEqual(negativeStepSize);
      expect(stepSizeChangedSpy).toBeCalled();
    });

    test('shouldn\'t allow to set value that is more than range', () => {
      const currentStepSize = model.options.stepSize;
      const range = model.options.maxValue - model.options.minValue;
      const stepMoreThanRange = range + 10;

      model.setStepSize(stepMoreThanRange);

      expect(model.options.stepSize).toEqual(currentStepSize);
      expect(model.options.stepSize).not.toEqual(stepMoreThanRange);
      expect(stepSizeChangedSpy).not.toBeCalled();
    });

    test('should not set any non-finite value', () => {
      const currentStepSize = model.options.stepSize;

      [0, NaN, -Infinity, Infinity].forEach((value) => model.setStepSize(value));

      expect(model.options.stepSize).toEqual(currentStepSize);
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

      expect(model.options.value1).toEqual(0);
      expect(valueChangedSpy).toBeCalled();
    });

    test('should set 2nd value to -40 (don\'t consider value1)', () => {
      model.setValue(2, -40);

      expect(model.options.value2).toEqual(-40);
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

      expect(model.options.value1).toEqual(limitValue);
      expect(valueChangedSpy).toBeCalled();
    });

    test.each`
      valueName     | value
      ${'minValue'} | ${defaultOptions.minValue}
      ${'maxValue'} | ${defaultOptions.maxValue}
    `('should set value1 to $valueName if passed value === $valueName', ({ value }) => {
      model.setValue(1, value);

      expect(model.options.value1).toEqual(value);
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

      test.each`
        primaryValue                | secondaryValue                                      | valueChange
        ${{ number: 1, value: 0 }}  | ${{ number: 2, sourceValue: -10, resultValue: 10 }} | ${{ side: 'less', sign: '+' }}
        ${{ number: 2, value: 10 }} | ${{ number: 1, sourceValue: 20, resultValue: 0 }}   | ${{ side: 'more', sign: '-' }}
      `(
        'if value$secondaryValue.number intent to set to $valueChange.side than value$primaryValue.number, set value$secondaryValue.number to value$primaryValue.number $valueChange.sign stepSize',
        ({ primaryValue, secondaryValue }: {
          primaryValue: { number: 1 | 2, value: number },
          secondaryValue: { number: 1 | 2, sourceValue: number, resultValue: number }
        }) => {
          customModel.setValue(primaryValue.number, primaryValue.value);
          customModel.setValue(secondaryValue.number, secondaryValue.sourceValue);

          expect(customModel.options[`value${primaryValue.number}`]).toEqual(primaryValue.value);
          expect(customModel.options[`value${secondaryValue.number}`]).toEqual(secondaryValue.resultValue);
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

    test('should set isVertical to true if true passed', () => {
      model.setVerticalState(true);

      expect(model.options.isVertical).toEqual(true);
      expect(isVerticalChangedSpy).toBeCalled();
    });

    test('should set isVertical to false if false passed', () => {
      model.setVerticalState(false);

      expect(model.options.isVertical).toEqual(false);
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
    ])('should %s isInterval if %s passed', (state, booleanValue) => {
      model.setInterval(booleanValue);

      expect(model.options.isInterval).toEqual(booleanValue);
      expect(isIntervalChangedSpy).toBeCalled();
    });

    test.todo('should emit valueChanged if value(s) was(were) changed in fixValues()');
  });

  describe('setShowProgress()', () => {
    const showProgressChangedSpy = jest.fn();

    beforeAll(() => {
      initModelWithDefaultOptions();
      model.on('showProgressChanged', showProgressChangedSpy);
    });

    test.each([
      ['enable', true],
      ['disable', false],
    ])('should %s progressBar if %s passed', (state, booleanValue) => {
      model.setShowProgress(booleanValue);

      expect(model.options.showProgressBar).toEqual(booleanValue);
    });
  });
});
