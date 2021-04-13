import './styles/styles.scss';

$(() => {
  const $h1: JQuery<HTMLHeadingElement> = $('.heading-1');
  $h1.html('hello TypeScript using Webpack!');

  const $span: JQuery<HTMLSpanElement> = $('.text-block__caption');
  $span.on('click', function clickOnSpan(): void {
    $(this).toggleClass('text-block__caption_highlighted');
  });
});
