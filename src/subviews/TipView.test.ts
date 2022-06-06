/**
 * @jest-environment jsdom
 */
import TipView from './TipView';

describe('TipView', () => {
  let tip: TipView;
  let tipElement: HTMLElement;
  beforeAll(() => {
    tip = new TipView();
    [tipElement] = tip.$elem.get();
  });

  test('should create instance of class TipView', () => {
    expect(tip).toHaveProperty('$elem');
  });

  describe('if constructor called w/o parameters or with (1) parameter (number)', () => {
    test('$elem should contain HTML element w/ class slider__tip and slider__tip_1 as default', () => {
      expect(tipElement.className).toBe('slider__tip slider__tip_1');
    });
  });

  describe('if constructor called w/ (2) parameter (number)', () => {
    test('$elem should contain HTML element w/ class slider__tip and slider__tip_2', () => {
      const tip2 = new TipView(2);

      expect(tip2.$elem[0].className).toBe('slider__tip slider__tip_2');
    });
  });

  describe('setValue', () => {
    test('should new value as inner text of tip element', () => {
      tip.setValue(123);

      expect(tip.$elem.text()).toBe('123');
    });

    test('should not set value as inner text of tip element if value in not finite number', () => {
      const currentTipValue = tip.$elem.text();
      [NaN, -Infinity, Infinity].forEach((value) => tip.setValue(value));

      expect(tip.$elem.text()).toBe(currentTipValue);
    });
  });
});
