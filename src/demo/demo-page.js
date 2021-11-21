import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider');
  const slider1 = $slider1.sliderPlugin({
    // stepSize: 1,
    // minValue: -250,
    // maxValue: 250,
    value1: -104,
    value2: -102,
    // isVertical: false,
    // isInterval: true,
    // showTip: true,
    // showScale: true,
    // showProgressBar: true,
  });
});
