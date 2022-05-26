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
      expect(view.$elem.hasClass(`slider_${modifier}`)).toEqual(false);

      view[method](true);

      expect(view.$elem.hasClass(`slider_${modifier}`)).toEqual(true);
    });

    test('setPosition method should set custom css property --value-1|2-position for $controlContainer', () => {
      const positions = { 1: 10, 2: 40 };

      getEntriesWithTypedKeys(positions).forEach(([number, position]) => {
        expect($controlContainer.css(`--value-${number}-position`))
          .not.toEqual(`${position}%`);

        view.setPosition(number, position);

        expect($controlContainer.css(`--value-${number}-position`))
          .toEqual(`${position}%`);
      });
    });

    test('setThumbThickness method should set custom css property --thumb-thickness for $controlContainer', () => {
      view.setThumbThickness(20);

      expect($controlContainer.css('--thumb-thickness')).toEqual('20%');
    });
  });

  describe('DOM events', () => {
    let controlContainerElem: HTMLElement;
    beforeEach(() => {
      view = new View();
      $viewElem = view.$elem;
      $controlContainer = view.$controlContainer;
      controlContainerElem = view.controlContainerElem;
    });

    test('contextmenu event should return false', () => {
      let eventResult;
      const contextMenuListenerSpy = jest.fn((event) => {
        eventResult = event.result;
      });
      $controlContainer.on('contextmenu', contextMenuListenerSpy);

      $controlContainer.trigger('contextmenu');

      expect(eventResult).toStrictEqual(false);
    });

    test('pointerdown event should call preventDefault()', () => {
      // let isDefaultPrevented: boolean;
      // const pointerDownListenerSpy = (event: PointerEvent) => {
      //   isDefaultPrevented = event.defaultPrevented;
      // };
      // controlContainerElem.addEventListener('pointerdown', pointerDownListenerSpy);
      const pointerEvent = new MouseEvent('pointerdown', { button: 0 });
      // const preventDefaultSpy = jest.spyOn(pointerEvent, 'preventDefault');

      controlContainerElem.dispatchEvent(pointerEvent);
      expect(pointerEvent.defaultPrevented).toStrictEqual(true);
      // new Promise(() => {
      // }).then(() => {
        // expect(preventDefaultSpy).toBeCalled();
        // expect(isDefaultPrevented).toStrictEqual(true);
      // });
    });
  });
});
