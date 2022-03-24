import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 3,
    minValue: 120,
    maxValue: 400,
    value1: 120,
    value2: 310,
    isVertical: true,
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
  const $panel1Interval = $('.panel__interval', $panel1);
  const $panel1Vertical = $('.panel__vertical', $panel1);

  const slider1Options = window.slider1.debug.getOptions();
  console.log('slider1.getOptions(): ', slider1Options);

  if (slider1Options.isInterval) {
    $panel1Interval.attr('checked', true);
  }

  if (slider1Options.isVertical) {
    $panel1Vertical.attr('checked', true);
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
});
