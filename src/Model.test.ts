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
  test('getOptions returns the same object as options (not by content)', () => {
    const model: Model = new Model(options);
    const modelOptions = model.getOptions();

    expect(modelOptions).toBe(options);
  });
});
