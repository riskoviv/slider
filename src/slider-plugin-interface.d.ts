/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
interface ISliderPluginOptions {
  stepSize?: number,
  isVertical?: boolean,
  isInterval?: boolean
}

interface ISliderPluginGlobalOptions {
  options: ISliderPluginOptions;
}

interface ISliderPluginFunction {
  (options: ISliderPluginOptions): Object;
}

interface ISliderPlugin extends ISliderPluginGlobalOptions, ISliderPluginFunction { }

interface JQuery {
  sliderPlugin: ISliderPlugin;
}
