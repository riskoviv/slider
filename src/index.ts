import './styles/styles.scss';

$(() => {
  let $h1: JQuery<HTMLHeadingElement> = $('.heading-1');
  $h1.html('hello Webpack & TS!');
  
  let $span: JQuery<HTMLSpanElement> = $('.text-block__caption');
  $span.on('click', function (): void {
    $(this).toggleClass('text-block__caption_highlighted');
  })
});

