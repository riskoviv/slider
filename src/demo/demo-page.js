import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 3,
    minValue: 0,
    maxValue: 35,
    value1: 10,
    value2: 31,
    // isVertical: true,
    // isInterval: false,
    // showTip: false,
    // showScale: true,
    // showProgressBar: true,
  });

  console.log('slider1.getOptions(): ', window.slider1.debug.getOptions());
});
