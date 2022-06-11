import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 0.3,
    minValue: 0,
    maxValue: 1,
    value1: 0,
    value2: 1,
    // isVertical: true,
    isInterval: true,
    showTip: true,
    showScale: true,
    showProgressBar: true,
  });

  // const $slider2 = $('#slider2');
  // window.slider2 = $slider2.sliderPlugin({
  //   showScale: true,
  // });

  // console.log('slider2.getOptions(): ', window.slider2.debug.getOptions());

  const $panel1 = $('#panel1');
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Interval = $('.panel__interval', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Vertical = $('.panel__vertical', $panel1);
  /** @type {JQuery<HTMLInputElement>} */
  const $panel1Progress = $('.panel__progress', $panel1);

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
  const slider1Options = window.slider1.debug.getOptions();
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

  /**
   * @this HTMLInputElement isInterval checkbox element
   */
  function slider1ChangeIsInterval() {
    window.slider1.setInterval(this.checked);
  }

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
});
