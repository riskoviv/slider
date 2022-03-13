import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 3,
    minValue: 0,
    maxValue: 175,
    value1: 10,
    value2: 31,
    // isVertical: true,
    // isInterval: false,
    // showTip: false,
    // showScale: false,
    // showProgressBar: false,
  });

  console.log('slider1.getOptions(): ', window.slider1.debug.getOptions());
});
