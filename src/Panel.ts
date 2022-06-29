import './styles/panel-styles.scss';
import $ from 'jquery';
import { getFractionalPartSize } from './utils';

class Panel {
  private panelRootElement: JQuery<HTMLDivElement> = $('<div class="panel"><div class="panel__options panel__options_group_values"></div><div class="panel__options panel__options_group_states"></div></div>');

  private panelElements: { [elemName: string]: JQuery } = {};

  private pluginOptions: IPluginOptions;

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
    const stateOptions: [string, boolean, EventName, keyof IPluginPublicStateMethods][] = [
      ['vertical', this.pluginOptions.isVertical, 'isVerticalChanged', 'setVerticalState'],
      ['interval', this.pluginOptions.isInterval, 'isIntervalChanged', 'setInterval'],
      ['bar', this.pluginOptions.showProgressBar, 'showProgressChanged', 'setShowProgress'],
      ['scale', this.pluginOptions.showScale, 'showScaleChanged', 'setShowScale'],
      ['tip', this.pluginOptions.showTip, 'showTipChanged', 'setShowTip'],
    ];
    const values: [string, number, EventName, keyof IPluginPublicValueMethods][] = [
      ['from', this.pluginOptions.value1, 'value1Changed', 'setValue1'],
      ['to', this.pluginOptions.value2, 'value2Changed', 'setValue2'],
    ];
    const valueOptions: [string, number, EventName, keyof IPluginPublicValueMethods][] = [
      ['min', this.pluginOptions.minValue, 'minValueChanged', 'setMinValue'],
      ['max', this.pluginOptions.maxValue, 'maxValueChanged', 'setMaxValue'],
      ['step', this.pluginOptions.stepSize, 'stepSizeChanged', 'setStepSize'],
    ];
    stateOptions.forEach(([label, value, event, method]) => {
      this.panelElements[label] = this.makeInputCheckboxElement(label, value, event, method);
    });
    values.forEach(([label, value, event, method]) => {
      this.panelElements[label] = this.makeInputNumberElement(
        label,
        value,
        event,
        method,
        this.pluginOptions.stepSize,
        this.pluginOptions.minValue,
      );
    });
    valueOptions.forEach(([label, value, event, method]) => {
      this.panelElements[label] = this.makeInputNumberElement(
        label, value, event, method, Panel.getStepPrecision(this.pluginOptions.stepSize),
      );
    });
  }

  private makeInputCheckboxElement(
    label: string, checked: boolean, event: EventName, method: keyof IPluginPublicStateMethods,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="checkbox" class="panel__input panel__input_type_checkbox" data-role="${label}"></input>`);
    $inputElement[0].checked = checked;
    return this.appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
      label, $inputElement, sliderEvent: event, inputEventType: 'change', sliderStateMethod: method,
    });
  }

  private makeInputNumberElement(
    label: string,
    value: number,
    event: EventName,
    method: keyof IPluginPublicValueMethods,
    step?: number,
    min?: number,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="number" class="panel__input panel__input_type_number" data-role="${label}" value="${value}"></input>`);
    $inputElement.prop({ step, min });
    return this.appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
      label, $inputElement, sliderEvent: event, inputEventType: 'input', sliderValueMethod: method,
    });
  }

  private appendElementToLabelAndSubscribeToSliderEventAndAddEventListener({
    label,
    $inputElement,
    sliderEvent,
    inputEventType,
    sliderValueMethod,
    sliderStateMethod,
  }: {
    label: string,
    $inputElement: JQuery<HTMLInputElement>,
    sliderEvent: EventName,
    inputEventType: 'input' | 'change',
    sliderValueMethod?: keyof IPluginPublicValueMethods,
    sliderStateMethod?: keyof IPluginPublicStateMethods,
  }) {
    const $labelElement = $(`<label class="panel__label" data-role="${label}">${label}</label>`)
      .append($inputElement);
    this.sliderPlugin.subscribeElementToEvent($inputElement[0], sliderEvent);
    const panelInputListener = (e: Event) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        if (inputEventType === 'input' && sliderValueMethod) {
          this.sliderPlugin[sliderValueMethod](target.valueAsNumber);
        } else if (inputEventType === 'change' && sliderStateMethod) {
          this.sliderPlugin[sliderStateMethod](target.checked);
        }
      }
    };
    $inputElement[0].addEventListener(inputEventType, panelInputListener);

    return $labelElement;
  }
}

export default Panel;
