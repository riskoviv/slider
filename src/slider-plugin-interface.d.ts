/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
interface ISliderPluginOptions {

}

interface ISliderPluginGlobalOptions {
  options: ISliderPluginOptions;
}

interface ISliderPluginFunction {
  (options: ISliderPluginOptions): JQuery;
}

interface ISliderPlugin extends ISliderPluginGlobalOptions, ISliderPluginFunction { }

interface JQuery {
  sliderPlugin: ISliderPlugin;
}
