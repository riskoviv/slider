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
  describe('initialized with all default options', () => {
    initModelWithDefaultOptions();

    test('sets allowedValuesCount property to 21', () => {
      expect(model.allowedValuesCount).toEqual(21);
    });

    test('sets fractionalPrecision property to 0', () => {
      expect(model.fractionalPrecision).toEqual(0);
    });

    test('getOptions returns the same object as defaultOptions (by content)', () => {
      const modelOptions = model.getOptions();

      expect(modelOptions).toEqual(defaultOptions);
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
      const setStepSizeCallbackSpy = jest.fn();

      beforeAll(() => {
        initModelWithDefaultOptions();
        model.on('stepSizeChanged', setStepSizeCallbackSpy);
      });

      test('should set positive integer that is less than range', () => {
        model.setStepSize(20);

        expect(model.options.stepSize).toEqual(20);
        expect(setStepSizeCallbackSpy).toBeCalled();
      });

      test('should set positive float that is less than range', () => {
        model.setStepSize(15.5);

        expect(model.options.stepSize).toBeCloseTo(15.5);
        expect(setStepSizeCallbackSpy).toBeCalled();
      });

      test('shouldn\'t allow to set any negative value and set absolute value of it instead', () => {
        const negativeStepSize = -20;

        model.setStepSize(negativeStepSize);

        expect(model.options.stepSize).toEqual(-negativeStepSize);
        expect(model.options.stepSize).not.toEqual(negativeStepSize);
        expect(setStepSizeCallbackSpy).toBeCalled();
      });

      test('shouldn\'t allow to set value that is more than range', () => {
        const currentStepSize = model.options.stepSize;
        const range = model.options.maxValue - model.options.minValue;
        const stepMoreThanRange = range + 10;

        model.setStepSize(stepMoreThanRange);

        expect(model.options.stepSize).toEqual(currentStepSize);
        expect(model.options.stepSize).not.toEqual(stepMoreThanRange);
        expect(setStepSizeCallbackSpy).not.toBeCalled();
      });

      test('should not set any non-finite value', () => {
        const currentStepSize = model.options.stepSize;

        [0, NaN, -Infinity, Infinity].forEach((value) => model.setStepSize(value));

        expect(model.options.stepSize).toEqual(currentStepSize);
        expect(setStepSizeCallbackSpy).not.toBeCalled();
      });
    });

    describe('setValue() sets new 1st or 2nd value considering stepSize and correcting it if it\'s not satisfies stepSize', () => {
      const setValueCallbackSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on('valueChanged', setValueCallbackSpy);
      });

      afterAll(() => {
        model.off('valueChanged', setValueCallbackSpy);
      });

      test('sets 1st value to 0', () => {
        model.setValue(1, 0);

        expect(model.options.value1).toEqual(0);
        expect(setValueCallbackSpy).toBeCalled();
      });

      test('sets 2nd value to -40 (don\'t consider value1)', () => {
        model.setValue(2, -40);

        expect(model.options.value2).toEqual(-40);
        expect(setValueCallbackSpy).toBeCalled();
      });
    });
  });

  describe('initialized with default + some custom options', () => {
    describe('sets Model.fractionalPrecision to size of fractional part of options:', () => {
      test.each`
        option        | value      | precision
        ${'stepSize'} | ${10.5}    | ${1}
        ${'minValue'} | ${-100.55} | ${2}
        ${'maxValue'} | ${100.535} | ${3}
      `('if $option is $value, set to $precision', ({ option, value, precision }) => {
        model = new Model({ ...defaultOptions, [option]: value });

        expect(model.fractionalPrecision).toEqual(precision);
      });
    });

    describe('if isInterval is true, setValue() should consider value1 or value2', () => {
      let setValueCallbackSpy: jest.Mock;
      beforeAll(() => {
        model = new Model({ ...defaultOptions, isInterval: true });
        setValueCallbackSpy = jest.fn();
        model.on('valueChanged', setValueCallbackSpy);
      });

      afterAll(() => {
        model.off('valueChanged', setValueCallbackSpy);
      });

      test('if value2 intent to set to less than value1, set value2 to value1 + stepSize', () => {
        model.setValue(1, 0);
        model.setValue(2, -10);

        expect(model.options.value1).toEqual(0);
        expect(model.options.value2).toEqual(10);
        expect(setValueCallbackSpy).toBeCalledTimes(2);
      });

      test('if value1 intent to set to more than value2, set value1 to value2 - stepSize', () => {
        model.setValue(2, 10);
        model.setValue(1, 20);

        expect(model.options.value2).toEqual(10);
        expect(model.options.value1).toEqual(0);
        expect(setValueCallbackSpy).toBeCalledTimes(2);
      });
    });
  });
});
