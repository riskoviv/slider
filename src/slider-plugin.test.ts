/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import './slider-plugin';

describe('slider-plugin', () => {
  test('should create instance of slider plugin', () => {
    const $sliderContainer = $('<div class="slider-container"></div>');
    $(document.body).append($sliderContainer);
    const sliderInstance = $sliderContainer.sliderPlugin({});

    expect($sliderContainer.children().first().hasClass('slider')).toBe(true);
    expect(sliderInstance).toHaveProperty('debug');
  });
});
