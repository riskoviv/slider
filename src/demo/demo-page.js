import './demo-page-styles.scss';

$(() => {
  const $slider = $('#slider');
  $slider.css('height', '100px');
  $slider.css('background-color', '#a44');
  $.fn.sliderPlugin.options.isVertical = true;
  const plugin1 = $slider.sliderPlugin();
});
