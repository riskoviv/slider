import Model from './Model';

const options: IPluginOptions = {
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

describe('Model', () => {
  const model: Model = new Model(options);

  test('getOptions returns the same object as options (not by content)', () => {
    const modelOptions = model.getOptions();

    expect(modelOptions).toBe(options);
  });

  test('getStateOptions returns the same state options as they was passed on init', () => {
    const stateOptions: IPluginStateOptions = {
      isInterval: options.isInterval,
      isVertical: options.isVertical,
      showTip: options.showTip,
      showScale: options.showScale,
      showProgressBar: options.showProgressBar,
    };

    const modelStateOptions = model.getStateOptions();

    expect(modelStateOptions).toEqual(stateOptions);
  });

  test('getIndexByValueNumber() returns index of value 1 or 2', () => {
    const index = model.getIndexByValueNumber(1);

    expect(index).toBe(5);
  });

  test('getIndexByValue() returns index of value from range considering step', () => {
    expect(model.getIndexByValue(-100)).toBe(0);
    expect(model.getIndexByValue(-90)).toBe(1);
    expect(model.getIndexByValue(-50)).toBe(5);
  });

  test('getValueByIndex() returns value from range by index of that value', () => {
    expect(model.getValueByIndex(0)).toBe(-100);
    expect(model.getValueByIndex(1)).toBe(-90);
  });
});
