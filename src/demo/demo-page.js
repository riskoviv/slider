import './demo-page-styles.scss';
// eslint-disable-next-line import/extensions
import Panel from '../Panel.ts';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin({
    stepSize: 3,
    // minValue: 0,
    // maxValue: 500,
    // value1: 50,
    // value2: 92,
    // isVertical: true,
    isInterval: true,
    showTip: true,
    showScale: true,
    // showProgressBar: true,
  });

  const realPanel = new Panel(window.slider1);

  // const $slider2 = $('#slider2');
  // window.slider2 = $slider2.sliderPlugin({
  //   showScale: true,
  // });

  // console.log('slider2.getOptions(): ', window.slider2.getOptions());
});
