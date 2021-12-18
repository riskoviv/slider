import './demo-page-styles.scss';

$(() => {
  const $slider1 = $('#slider');
  const slider1 = $slider1.sliderPlugin({
    stepSize: 15,
    // minValue: -250,
    // maxValue: 250,
    // value1: -104,
    // value2: -102,
    // isVertical: true,
    // isInterval: false,
    // showTip: true,
    // showScale: true,
    // showProgressBar: true,
  });

  // console.log('slider1.getOptions(): ', slider1.getOptions());
});
