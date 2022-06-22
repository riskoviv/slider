import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    // stepSize: 100,
    // minValue: 0,
    // maxValue: 500,
    // value1: 50,
    // value2: 92,
    // isVertical: true,
    // isInterval: true,
    // showTip: true,
    // showScale: true,
    // showProgressBar: true,
  });

  // const $slider2 = $('#slider2');
  // window.slider2 = $slider2.sliderPlugin({
  //   showScale: true,
  // });

  // console.log('slider2.getOptions(): ', window.slider2.getOptions());

  const $panel1 = $('#panel1');
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Interval = $('.panel__interval', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Vertical = $('.panel__vertical', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Progress = $('.panel__progress', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Tip = $('.panel__tip', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Scale = $('.panel__scale', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Value1 = $('.panel__value1', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Value2 = $('.panel__value2', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1StepSize = $('.panel__step-size', $panel1);

  /**
   * @typedef {{
   *   stepSize: number;
   *   minValue: number;
   *   maxValue: number;
   *   value1: number;
   *   value2: number;
   *   isVertical: boolean;
   *   isInterval: boolean;
   *   showTip: boolean;
   *   showScale: boolean;
   *   showProgressBar: boolean;
   * }} SliderPluginOptions
   */

  /** @type {SliderPluginOptions} */
  const slider1Options = window.slider1.getOptions();
  console.log('slider1.getOptions(): ', slider1Options);

  if (slider1Options.isInterval) {
    $panel1Interval[0].checked = true;
  }

  if (slider1Options.isVertical) {
    $panel1Vertical[0].checked = true;
  }

  if (slider1Options.showProgressBar) {
    $panel1Progress[0].checked = true;
  }

  if (slider1Options.showTip) {
    $panel1Tip[0].checked = true;
  }

  if (slider1Options.showScale) {
    $panel1Scale[0].checked = true;
  }

  $panel1Value1.val(slider1Options.value1);
  $panel1Value1.attr({
    min: slider1Options.minValue,
    max: slider1Options.maxValue,
    step: slider1Options.stepSize,
  });

  $panel1Value2.val(slider1Options.value2);
  $panel1Value2.attr({
    min: slider1Options.minValue,
    max: slider1Options.maxValue,
    step: slider1Options.stepSize,
  });

  $panel1StepSize.val(slider1Options.stepSize);

  /**
   * @this HTMLInputElement isInterval checkbox element
   */
  function slider1ChangeIsInterval() {
    window.slider1.setInterval(this.checked);
  }

  window.slider1.subscribeElementToEvent($panel1Interval[0], 'isIntervalChanged');
  $panel1Interval.on('change', slider1ChangeIsInterval);

  /**
   * @this HTMLInputElement isVertical checkbox element
   */
  function slider1ChangeIsVertical() {
    window.slider1.setVerticalState(this.checked);
  }

  $panel1Vertical.on('change', slider1ChangeIsVertical);

  /**
   * @this HTMLInputElement showProgress checkbox element
   */
  function slider1ChangeShowProgress() {
    window.slider1.setShowProgress(this.checked);
  }

  $panel1Progress.on('change', slider1ChangeShowProgress);

  /**
   * @this HTMLInputElement showTip checkbox element
   */
  function slider1ChangeShowTip() {
    window.slider1.setShowTip(this.checked);
  }

  $panel1Tip.on('change', slider1ChangeShowTip);

  /**
   * @this HTMLInputElement showScale checkbox element
   */
  function slider1ChangeShowScale() {
    window.slider1.setShowScale(this.checked);
  }

  $panel1Scale.on('change', slider1ChangeShowScale);

  /**
   * @this HTMLInputElement value1 input number element
   */
  function slider1ChangeValue1() {
    window.slider1.setValue1(Number(this.value));
  }

  window.slider1.subscribeElementToEvent($panel1Value1[0], 'value1Changed');
  $panel1Value1.on('input', slider1ChangeValue1);

  /**
   * @this HTMLInputElement value1 input number element
   */
  function slider1ChangeValue2() {
    window.slider1.setValue2(Number(this.value));
  }

  window.slider1.subscribeElementToEvent($panel1Value2[0], 'value2Changed');
  $panel1Value2.on('input', slider1ChangeValue2);

  /**
   * @this HTMLInputElement stepSize input number element
   */
  function slider1ChangeStepSize() {
    window.slider1.setStepSize(Number(this.value));
  }

  window.slider1.subscribeElementToEvent($panel1StepSize[0], 'stepSizeChanged');
  $panel1StepSize.on('input', slider1ChangeStepSize);
});
