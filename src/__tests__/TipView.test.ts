import TipView from '../subviews/TipView';

describe('TipView', () => {
  let tip: TipView;
  let tipElement: HTMLElement;
  beforeAll(() => {
    tip = new TipView();
    [tipElement] = tip.$elem;
  });

  test('should create instance of class TipView', () => {
    expect(tip).toHaveProperty('$elem');
  });

  describe('if constructor called w/o parameters or with (1) parameter (number)', () => {
    test('$elem should contain HTML element w/ class slider__tip and slider__tip_1 as default', () => {
      expect(tipElement.className).toBe('slider__tip slider__tip_1');
    });
  });

  describe('if constructor called w/ (2) argument', () => {
    test('$elem property should contain HTML element w/ class slider__tip and slider__tip_2', () => {
      const tip2 = new TipView(2);

      expect(tip2.$elem[0].className).toBe('slider__tip slider__tip_2');
    });
  });

  describe('if constructor called w/ (3) argument', () => {
    test('$elem property should contain HTML element w/ className slider__tip slider__tip_3 slider__tip_hidden', () => {
      const tip3 = new TipView(3);

      expect(tip3.$elem[0].className).toBe('slider__tip slider__tip_3 slider__tip_hidden');
    });
  });

  describe('setValue', () => {
    test('if passed number, should set new value as inner text of tip element', () => {
      tip.setValue(123);

      expect(tip.$elem.text()).toBe('123');
    });

    test('should not set value as inner text of $elem if value is not finite number', () => {
      const currentTipValue = tip.$elem.text();
      [NaN, -Infinity, Infinity].forEach((value) => tip.setValue(value));

      expect(tip.$elem.text()).toBe(currentTipValue);
    });

    test('should set any string as inner text of $elem', () => {
      tip.setValue('900');

      expect(tip.$elem.text()).toBe('900');
    });
  });
});
