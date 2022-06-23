import './styles/panel-styles.scss';
import $ from 'jquery';

class Panel {
  private panelRootElement: JQuery<HTMLDivElement> = $('<div class="panel"></div>');

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
    Object.values(this.panelElements).forEach((element) => this.panelRootElement.append(element));
  }

  private subscribeElementsToBoundsChanges() {
    ['min', 'max', 'step'].forEach((bound) => {
      const boundChangeListener = (e: Event) => {
        const { target } = e;
        if (target instanceof HTMLInputElement) {
          this.panelElements.from.children().prop(bound, target.value);
          this.panelElements.to.children().prop(bound, target.value);
        }
      };
      this.panelElements[bound].children()[0].addEventListener('input', boundChangeListener);
    });
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
        this.pluginOptions.minValue,
        this.pluginOptions.maxValue,
        this.pluginOptions.stepSize,
      );
    });
    valueOptions.forEach(([label, value, event, method]) => {
      this.panelElements[label] = this.makeInputNumberElement(label, value, event, method);
    });
  }

  private makeInputCheckboxElement(
    label: string, checked: boolean, event: EventName, method: keyof IPluginPublicStateMethods,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="checkbox" class="panel__input-${label}"></input>`);
    $inputElement[0].checked = checked;
    const $labeledCheckboxElement = $(`<label class="panel__${label}">${label}</label>`)
      .append($inputElement);
    this.sliderPlugin.subscribeElementToEvent($inputElement[0], event);
    const inputChangeListener = (e: Event) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        this.sliderPlugin[method](target.checked);
      }
    };
    $inputElement[0].addEventListener('change', inputChangeListener);
    return $labeledCheckboxElement;
  }

  private makeInputNumberElement(
    label: string,
    value: number,
    event: EventName,
    method: keyof IPluginPublicValueMethods,
    min?: number,
    max?: number,
    step?: number,
  ) {
    const $inputElement: JQuery<HTMLInputElement> = $(`<input type="number" class="panel__input-${label}" value="${value}"></input>`);
    $inputElement.attr({ min, max, step });
    const $labeledNumberElement = $(`<label class="panel__${label}">${label}</label>`).append($inputElement);
    this.sliderPlugin.subscribeElementToEvent($inputElement[0], event);
    const inputValueChangeListener = (e: Event) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        this.sliderPlugin[method](Number(target.value));
      }
    };
    $inputElement[0].addEventListener('input', inputValueChangeListener);
    return $labeledNumberElement;
  }
}

export default Panel;
