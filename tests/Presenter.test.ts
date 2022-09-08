import $ from 'jquery';

import Presenter from '../src/Presenter';
import Model from '../src/Model';
import './mocks/ResizeObserver';

describe('Presenter', () => {
  const defaultOptions: SliderOptions = {
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
  let $element: JQuery;

  beforeAll(() => {
    $element = $('<div class="slider-container"></div>');
    $(document.body).append($element);
  });

  test('should create Presenter instance', () => {
    const model = new Model(defaultOptions);
    const presenter = new Presenter($element, model);

    expect(presenter).toBeInstanceOf(Presenter);
  });

  test('should create Presenter with all state options on', () => {
    const options: SliderOptions = {
      stepSize: 10,
      minValue: -100,
      maxValue: 100,
      value1: -50,
      value2: 50,
      isVertical: true,
      isInterval: true,
      showTip: true,
      showScale: true,
      showProgressBar: true,
    };

    const model = new Model(options);
    const presenter = new Presenter($element, model);

    expect(presenter).toBeInstanceOf(Presenter);
  });
});
