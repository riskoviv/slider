import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 10_000,
    minValue: 120_000,
    maxValue: 1_200_000,
    value1: 100_000,
    value2: 310_000,
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
   * @this HTMLElement isInterval checkbox element
   */
  function slider1ChangeIsInterval() {
    const isInterval = this.value;
    console.log('isInterval: ', isInterval);
    window.slider1.setInterval(isInterval);
  }

  $panel1Interval.on('change', slider1ChangeIsInterval);
});
