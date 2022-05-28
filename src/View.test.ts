/**
 * @jest-environment jsdom
 */

import $ from 'jquery';
import View from './View';
import { getEntriesWithTypedKeys } from './utils';

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
      expect($viewElem.hasClass('slider')).toBe(true);
    });

    test.each(['slider_vertical', 'slider_interval', 'slider_show-progress'])(
      'slider element should not contain a class %s',
      (className) => {
        expect($viewElem.hasClass(className)).toBe(false);
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

      expect($viewElem.hasClass('slider_vertical')).toBe(classes[0]);
      expect($viewElem.hasClass('slider_interval')).toBe(classes[1]);
      expect($viewElem.hasClass('slider_show-progress')).toBe(classes[2]);
    });
  });

  describe('View methods', () => {
    beforeEach(() => {
      view = new View();
      $viewElem = view.$elem;
      $controlContainer = view.$controlContainer;
    });

    test.each([
      ['toggleVertical', 'vertical'],
      ['toggleInterval', 'interval'],
      ['toggleProgressBar', 'show-progress'],
    ] as const)('%s method should toggle modifier class slider_%s', (method, modifier) => {
      expect(view.$elem.hasClass(`slider_${modifier}`)).toBe(false);

      view[method](true);

      expect(view.$elem.hasClass(`slider_${modifier}`)).toBe(true);
    });

    test('setPosition method should set custom css property --value-1|2-position for $controlContainer', () => {
      const positions = { 1: 10, 2: 40 };

      getEntriesWithTypedKeys(positions).forEach(([number, position]) => {
        expect($controlContainer.css(`--value-${number}-position`))
          .not.toBe(`${position}%`);

        view.setPosition(number, position);

        expect($controlContainer.css(`--value-${number}-position`))
          .toBe(`${position}%`);
      });
    });

    test('setThumbThickness method should set custom css property --thumb-thickness for $controlContainer', () => {
      view.setThumbThickness(20);

      expect($controlContainer.css('--thumb-thickness')).toBe('20%');
    });
  });

  describe('DOM events', () => {
    let controlContainerElem: HTMLDivElement;

    beforeAll(() => {
      view = new View();
      $viewElem = view.$elem;
      $controlContainer = view.$controlContainer;
      controlContainerElem = view.controlContainerElem;
      controlContainerElem.setPointerCapture = jest.fn();
    });

    test('contextmenu event should return false', () => {
      let eventResult;
      const contextMenuListenerSpy = jest.fn((event) => {
        eventResult = event.result;
      });
      $controlContainer.on('contextmenu', contextMenuListenerSpy);

      $controlContainer.trigger('contextmenu');

      expect(eventResult).toBe(false);
    });

    describe('pointerdown event', () => {
      let sliderPointerDownSpy: jest.Mock;

      beforeAll(() => {
        sliderPointerDownSpy = jest.fn();
        view.on('sliderPointerDown', sliderPointerDownSpy);
      });

      test('if e.button === 0 (LMB), pointerdown event should call preventDefault() & emit sliderPointerDown event', () => {
        const pointerEvent = new MouseEvent('pointerdown', { button: 0 });
        const preventDefaultSpy = jest.spyOn(pointerEvent, 'preventDefault');

        controlContainerElem.dispatchEvent(pointerEvent);

        expect(preventDefaultSpy).toBeCalled();
        expect(sliderPointerDownSpy).toBeCalled();
      });

      test('if e.button !== 0 (LMB), pointerdown event should NOT call preventDefault() & emit sliderPointerDown event', () => {
        const pointerEvent = new MouseEvent('pointerdown', { button: 1 });
        const preventDefaultSpy = jest.spyOn(pointerEvent, 'preventDefault');

        controlContainerElem.dispatchEvent(pointerEvent);

        expect(preventDefaultSpy).not.toBeCalled();
        expect(sliderPointerDownSpy).not.toBeCalled();
      });
    });
  });
});
