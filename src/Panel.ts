import $ from 'jquery';

import './styles/panel-styles.scss';
import { getFractionalPartSize } from './utils';

class Panel {
  private panelRootElement: JQuery<HTMLDivElement> = $('<div class="panel"><div class="panel__options panel__options_group_values"></div><div class="panel__options panel__options_group_states"></div></div>');

  private panelElements: { [elemName: string]: JQuery } = {};

  private pluginOptions: SliderOptions;

  constructor(private sliderPlugin: JQuery) {
    this.pluginOptions = sliderPlugin.getOptions();
    this.makePanelElements();
    this.subscribeElementsToBoundsChanges();
    this.appendElementsToPanel();
    this.sliderPlugin.parent().append(this.panelRootElement);
  }

  private appendElementsToPanel() {
    Object.values(this.panelElements).forEach((element) => {
      element.has('.panel__input_type_number')
        .appendTo(this.panelRootElement.find('.panel__options_group_values'));
      element.has('.panel__input_type_checkbox')
        .appendTo(this.panelRootElement.find('.panel__options_group_states'));
    });
  }

  private static getStepPrecision(value: string | number) {
    return 1 / 10 ** getFractionalPartSize(value);
  }

  private subscribeElementsToBoundsChanges() {
    const bounds = ['min', 'step'];
    bounds.forEach((bound) => {
      const setValuesBounds = (e: Event) => {
        const { target } = e;
        if (target instanceof HTMLInputElement) {
          this.panelElements.from.children().prop(bound, target.value);
          this.panelElements.to.children().prop(bound, target.value);
        }
      };
      this.panelElements[bound].children()[0].addEventListener('input', setValuesBounds);
    });

    bounds.push('max');
    const setBoundsStep = (e: Event) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        const boundStepSize = Panel.getStepPrecision(target.value);
        target.min = String(boundStepSize);
        bounds.forEach((bound) => {
          this.panelElements[bound].children().prop('step', boundStepSize);
        });
      }
    };
    this.panelElements.step.children()[0].addEventListener('input', setBoundsStep);

    const toggleToInput = (isInterval: boolean) => {
      this.panelElements.to.toggleClass('panel__label_disabled', !isInterval);
      this.panelElements.to.children().prop('disabled', !isInterval);
    };
    toggleToInput(this.pluginOptions.isInterval);
    const checkIsInterval = (e: Event) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        toggleToInput(target.checked);
      }
    };
    this.panelElements.interval.children()[0].addEventListener('change', checkIsInterval);
  }

  private makePanelElements() {
    const stateOptions: [string, boolean, ModelEvent, keyof PluginStateMethods][] = [
      ['vertical', this.pluginOptions.isVertical, 'isVerticalChanged', 'setVerticalState'],
      ['interval', this.pluginOptions.isInterval, 'isIntervalChanged', 'setInterval'],
      ['bar', this.pluginOptions.showProgressBar, 'showProgressChanged', 'setShowProgress'],
      ['scale', this.pluginOptions.showScale, 'showScaleChanged', 'setShowScale'],
      ['tip', this.pluginOptions.showTip, 'showTipChanged', 'setShowTip'],
    ];
    const values: [string, number, ModelEvent, keyof PluginValueMethods][] = [
      ['from', this.pluginOptions.value1, 'value1Changed', 'setValue1'],
      ['to', this.pluginOptions.value2, 'value2Changed', 'setValue2'],
    ];
    const valueOptions: [string, number, ModelEvent, keyof PluginValueMethods][] = [
      ['min', this.pluginOptions.minValue, 'minValueChanged', 'setMinValue'],
      ['max', this.pluginOptions.maxValue, 'maxValueChanged', 'setMaxValue'],
      ['step', this.pluginOptions.stepSize, 'stepSizeChanged', 'setStepSize'],
    ];
    stateOptions.forEach((elementData) => {
      this.panelElements[elementData[0]] = this.makeInputCheckboxElement(...elementData);
    });
    values.forEach((elementData) => {
      this.panelElements[elementData[0]] = this.makeInputNumberElement(...elementData);
    });
    valueOptions.forEach((elementData) => {
      this.panelElements[elementData[0]] = this.makeInputNumberElement(
        ...elementData,
        Panel.getStepPrecision(this.pluginOptions.stepSize),
      );
    });
  }

  private makeInputCheckboxElement(
    label: string,
    checked: boolean,
    event: ModelEvent,
    method: keyof PluginStateMethods,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="checkbox" class="panel__input panel__input_type_checkbox" data-role="${label}"></input>`);
    $inputElement[0].checked = checked;
    return this.appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
      label, $inputElement, sliderEvent: event, inputEventType: 'change', sliderMethod: method,
    });
  }

  private makeInputNumberElement(
    label: string,
    value: number,
    event: ModelEvent,
    method: keyof PluginValueMethods,
    step: number = this.pluginOptions.stepSize,
    min: number = this.pluginOptions.minValue,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="number" class="panel__input panel__input_type_number" data-role="${label}"></input>`);
    switch (label) {
      case 'from':
      case 'to':
        $inputElement.prop({ value, step, min });
        break;
      default:
        $inputElement.prop({ value, step });
    }
    return this.appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
      label, $inputElement, sliderEvent: event, inputEventType: 'input', sliderMethod: method,
    });
  }

  private appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
    label,
    $inputElement,
    sliderEvent,
    inputEventType,
    sliderMethod,
  }: {
    label: string,
    $inputElement: JQuery<HTMLInputElement>,
    sliderEvent: ModelEvent,
  } & ({
    inputEventType: 'input',
    sliderMethod: keyof PluginValueMethods,
  } | {
    inputEventType: 'change',
    sliderMethod: keyof PluginStateMethods,
  })) {
    const $labelElement = $(`<label class="panel__label" data-role="${label}">${label}</label>`)
      .append($inputElement);
    this.sliderPlugin.subscribe({ event: sliderEvent, subscriber: $inputElement[0] });
    interface SubscribeSetEvent extends Event {
      isSubscribeSet?: boolean;
    }
    const panelInputListener = (e: SubscribeSetEvent) => {
      const { target } = e;
      const isHTMLInputElement = target instanceof HTMLInputElement;
      const isSubscribeSetEvent = e.isSubscribeSet;
      const canPassValueToPlugin = isHTMLInputElement && !isSubscribeSetEvent;
      if (canPassValueToPlugin) {
        if (inputEventType === 'input') {
          this.sliderPlugin[sliderMethod](target.valueAsNumber);
        } else if (inputEventType === 'change') {
          this.sliderPlugin[sliderMethod](target.checked);
        }
      }
    };
    $inputElement[0].addEventListener(inputEventType, panelInputListener);

    return $labelElement;
  }
}

export default Panel;
