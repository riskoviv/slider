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

    test('getOptions returns the same object as options (not by content)', () => {
      const modelOptions = model.getOptions();

      expect(modelOptions).toBe(defaultOptions);
    });

    test('getStateOptions returns the same state options as they was passed on init', () => {
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
  });

  describe('setters set new values to options', () => {
    describe('setStepSize(stepSize: number) set or don\t set values as stepSize option:', () => {
      const setStepSizeCallbackSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on('stepSizeChanged', setStepSizeCallbackSpy);
      });

      afterEach(() => {
        setStepSizeCallbackSpy.mockReset();
      });

      test('sets positive integer that is less than range', () => {
        model.setStepSize(20);

        expect(model.options.stepSize).toEqual(20);
        expect(setStepSizeCallbackSpy).toBeCalled();
      });

      test.todo('sets positive float that is less than range');
      test.todo('don\'t allow to set any negative value');
      test.todo('don\'t allow to set value that is more than range');
    });

    describe('setValue() sets new 1st or 2nd value considering stepSize and correcting it if it\'s not satisfies stepSize', () => {
      const setValueCallbackSpy = jest.fn();

      beforeEach(() => {
        initModelWithDefaultOptions();
        model.on('valueChanged', setValueCallbackSpy);
      });

      afterEach(() => {
        setValueCallbackSpy.mockReset();
      });

      test('sets 1st value to 0', () => {
        model.setValue(1, 0);

        expect(model.options.value1).toEqual(0);
        expect(setValueCallbackSpy).toBeCalled();
      });

      test('sets 2nd value to 40', () => {
        model.setValue(2, 40);

        expect(model.options.value2).toEqual(40);
        expect(setValueCallbackSpy).toBeCalled();
      });

      describe('value2 can\'t be set to less than value1, so it:', () => {
        test('sets to value1 + stepSize if maxValue - value1 > stepSize', () => {
          model.setValue(2, -10);

          expect(model.options.value2).toEqual(20);
          expect(setValueCallbackSpy).toBeCalled();
        });
      });
    });
  });
});
