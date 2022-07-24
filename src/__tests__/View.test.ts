import View from '../View';
import { getEntriesWithTypedKeys } from '../utils';

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
      expect($controlContainer.parent()[0]).toBe($viewElem[0]);
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
    test.each`
      option               | modifier           | viewOptions
      ${'isVertical'}      | ${'vertical'}      | ${[true, false, false]}
      ${'isInterval'}      | ${'interval'}      | ${[false, true, false]}
      ${'showProgressBar'} | ${'show-progress'} | ${[false, false, true]}
    `(
      'if options has $option: true, view element should contain class slider_$modifier',
      ({ option, viewOptions: [verticalState, intervalState, progressState] }: {
        option: keyof StateOptions,
        viewOptions: boolean[],
      }) => {
        view = new View({ [option]: true });
        $viewElem = view.$elem;

        expect($viewElem.hasClass('slider_vertical')).toBe(verticalState);
        expect($viewElem.hasClass('slider_interval')).toBe(intervalState);
        expect($viewElem.hasClass('slider_show-progress')).toBe(progressState);
      },
    );

    test('if created w/ all options to true, $elem should have all custom classes', () => {
      view = new View({ isVertical: true, isInterval: true, showProgressBar: true });

      expect(view.$elem.hasClass('slider_vertical')).toBe(true);
      expect(view.$elem.hasClass('slider_interval')).toBe(true);
      expect(view.$elem.hasClass('slider_show-progress')).toBe(true);
    });
  });

  describe('View methods', () => {
    beforeEach(() => {
      view = new View();
      $viewElem = view.$elem;
      $controlContainer = view.$controlContainer;
    });

    test.each<[keyof ViewStateMethods, string]>([
      ['toggleVertical', 'vertical'],
      ['toggleInterval', 'interval'],
      ['toggleProgressBar', 'show-progress'],
    ])('%s method should toggle modifier class slider_%s', (method, modifier) => {
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

    describe('pointerdown DOM event & sliderPointerDown event that it causes', () => {
      let sliderPointerDownSpy: jest.Mock;

      beforeAll(() => {
        sliderPointerDownSpy = jest.fn();
        view.on({ event: 'sliderPointerDown', handler: sliderPointerDownSpy });
      });

      test('if e.button === 0 (LMB), pointerdown event should call preventDefault() & emit sliderPointerDown event', () => {
        const pointerDownEvent = new MouseEvent('pointerdown');
        const preventDefaultSpy = jest.spyOn(pointerDownEvent, 'preventDefault');
        Object.defineProperties(pointerDownEvent, {
          pointerId: { value: 1 },
          target: { value: view.$elem[0] },
          offsetX: { value: 100 },
          offsetY: { value: 0 },
        });
        controlContainerElem.dispatchEvent(pointerDownEvent);

        expect(preventDefaultSpy).toBeCalled();
        expect(sliderPointerDownSpy).toBeCalledWith({
          target: view.$elem[0],
          offsetX: 100,
          offsetY: 0,
        });
      });

      test('if e.button !== 0 (LMB), pointerdown event should NOT call preventDefault() & emit sliderPointerDown event', () => {
        const pointerEvent = new MouseEvent('pointerdown', { button: 1 });
        const preventDefaultSpy = jest.spyOn(pointerEvent, 'preventDefault');

        controlContainerElem.dispatchEvent(pointerEvent);

        expect(preventDefaultSpy).not.toBeCalled();
        expect(sliderPointerDownSpy).not.toBeCalled();
      });

      test('should call console.error if pointerDown event is ocurred on controlContainer and there is no listeners attached to sliderPointerDown event', () => {
        view = new View();
        const pointerDownEvent = new MouseEvent('pointerdown');
        Object.defineProperties(pointerDownEvent, {
          pointerId: { value: 1 },
          target: { value: view.controlContainerElem },
          offsetX: { value: 42 },
          offsetY: { value: 0 },
        });
        Object.defineProperty(view.controlContainerElem, 'setPointerCapture', { value: jest.fn() });
        jest.spyOn(console, 'error');
        const mockConsoleError = console.error as jest.MockedFunction<typeof console.error>;
        const emitError = new Error();
        emitError.name = 'EmitError';
        emitError.message = 'sliderPointerDown event is not registered. arg = { target: [object HTMLDivElement], offsetX: 42, offsetY: 0 }';

        view.controlContainerElem.dispatchEvent(pointerDownEvent);

        expect(mockConsoleError).toBeCalledWith(emitError);
      });
    });
  });
});
