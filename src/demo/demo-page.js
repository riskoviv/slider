import './demo-page-styles.scss';
// eslint-disable-next-line import/extensions
import Panel from '../Panel.ts';

$(() => {
  window.slider1 = $('#slider1').sliderPlugin();
  window.panel1 = new Panel(window.slider1);

  window.slider2 = $('#slider2').sliderPlugin({
    showScale: true,
    showProgressBar: true,
    showTip: true,
    isInterval: true,
    minValue: 12.3,
    maxValue: 54.5,
    stepSize: 3.49,
    value1: 29.75,
    value2: 36.73,
  });
  window.panel2 = new Panel(window.slider2);

  window.slider3 = $('#slider3').sliderPlugin({
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

  window.slider4 = $('#slider4').sliderPlugin({
    isVertical: true,
    showScale: true,
    showTip: true,
    minValue: 0,
    maxValue: 100,
    value1: 0,
  });
  window.panel4 = new Panel(window.slider4);

  const $infoButton = $('.js-demo-page__info-button');
  const $description = $('.js-demo-page__description');

  const handleInfoButtonClick = () => {
    $description.addClass('demo-page__description_shown');
    $infoButton.addClass('demo-page__info-button_hidden');
  };

  const handleDescriptionClick = () => {
    $description.removeClass('demo-page__description_shown');
    $infoButton.removeClass('demo-page__info-button_hidden');
  };

  $infoButton.on('click', handleInfoButtonClick);
  $description.on('click', handleDescriptionClick);
});
