import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 1,
    minValue: -250,
    maxValue: -150,
    value1: -204,
    value2: -170,
    // isVertical: true,
    // isInterval: false,
    // showTip: true,
    // showScale: true,
    // showProgressBar: true,
  });

  console.log('slider1.getOptions(): ', window.slider1.getOptions());
});
