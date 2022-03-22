import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 3,
    minValue: 0,
    maxValue: 175,
    value1: 10,
    value2: 31,
    // isVertical: true,
    isInterval: true,
    showTip: true,
    showScale: true,
    showProgressBar: true,
  });

  const $slider2 = $('#slider2');
  window.slider2 = $slider2.sliderPlugin({
    showScale: true,
  });

  console.log('slider1.getOptions(): ', window.slider1.debug.getOptions());
  console.log('slider2.getOptions(): ', window.slider2.debug.getOptions());
});
