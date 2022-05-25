/**
 * @jest-environment jsdom
 */

import $ from 'jquery';
import View from './View';

describe('View', () => {
  let view: View;
  let $viewElem: JQuery;
  let $controlContainer: JQuery;

  describe('if instantiated with no options', () => {
    beforeAll(() => {
      view = new View();
      $viewElem = view.$elem;
      $controlContainer = view.$controlContainer;
    });

    test('should create instance of View', () => {
      expect(view).toBeInstanceOf(View);
    });

    test('$elem should contain $controlContainer', () => {
      expect($controlContainer.parent()).toStrictEqual($viewElem);
    });

    test('$elem should have class \'slider\'', () => {
      expect($viewElem.hasClass('slider')).toEqual(true);
    });

    test.each(['slider_vertical', 'slider_interval', 'slider_show-progress'])(
      'slider element should not contain a class %s',
      (className) => {
        expect($viewElem.hasClass(className)).toEqual(false);
      },
    );
  });

  describe('if instantiated with some custom options', () => {
    test.each([
      ['isVertical', 'vertical', [true, false, false]],
      ['isInterval', 'interval', [false, true, false]],
      ['showProgressBar', 'show-progress', [false, false, true]],
    ])('if options has %s: true, view element should contain class slider_%s', (option, modifier, classes) => {
      view = new View({ [option]: true });
      $viewElem = view.$elem;

      expect($viewElem.hasClass('slider_vertical')).toEqual(classes[0]);
      expect($viewElem.hasClass('slider_interval')).toEqual(classes[1]);
      expect($viewElem.hasClass('slider_show-progress')).toEqual(classes[2]);
    });
  });
});
