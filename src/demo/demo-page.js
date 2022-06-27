import './demo-page-styles.scss';
// eslint-disable-next-line import/extensions
import Panel from '../Panel.ts';

$(() => {
  const $slider1 = $('#slider1');
  window.slider1 = $slider1.sliderPlugin();
  window.panel1 = new Panel(window.slider1);

  const $slider2 = $('#slider2');
  window.slider2 = $slider2.sliderPlugin({
    showScale: true,
    showProgressBar: true,
    showTip: true,
    isInterval: true,
  });
  window.panel2 = new Panel(window.slider2);

  const $slider3 = $('#slider3');
  window.slider3 = $slider3.sliderPlugin({
    isVertical: true,
    isInterval: true,
    showTip: true,
    minValue: 0,
    maxValue: 10000,
    stepSize: 100,
    value1: 1000,
    value2: 5000,
  });
  window.panel3 = new Panel(window.slider3);
});
