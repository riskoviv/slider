import Logger from '../src/Logger';

jest.spyOn(console, 'info');
const consoleInfoMock = console.info as jest.MockedFunction<typeof console.info>;
jest.spyOn(console, 'warn');
const consoleWarnMock = console.warn as jest.MockedFunction<typeof console.warn>;
jest.spyOn(console, 'error');
const consoleErrorMock = console.error as jest.MockedFunction<typeof console.error>;

describe('Logger', () => {
  test('pluginWarn() should emit console.warn on behalf of slider-plugin', () => {
    const pluginWarnTestMessage = 'pluginWarn test';

    Logger.pluginWarn(pluginWarnTestMessage);

    const [warnDescription, , warnMessage]: string[] = consoleWarnMock.mock.lastCall;
    expect(warnDescription.startsWith('%cslider-plugin at ')).toBe(true);
    expect(warnMessage).toBe(pluginWarnTestMessage);
  });

  test('modelWarn() should emit console.warn on behalf of Model', () => {
    const modelWarnTestMessage = 'modelWarn test';

    Logger.modelWarn(modelWarnTestMessage);

    const [warnDescription, , warnMessage]: string[] = consoleWarnMock.mock.lastCall;
    expect(warnDescription.startsWith('%cModel at ')).toBe(true);
    expect(warnMessage).toBe(modelWarnTestMessage);
  });

  test('emitError() should emit console.error on behalf of EventEmitter', () => {
    const emitErrorInstance = new Error();
    const emitErrorName = 'EmitError';
    const emitErrorTestMessage = 'error occurred on emit!';
    emitErrorInstance.name = emitErrorName;
    emitErrorInstance.message = emitErrorTestMessage;

    Logger.emitError(emitErrorInstance);

    const [errorDescription, , errorMessage]: string[] = consoleErrorMock.mock.lastCall;
    expect(errorDescription.startsWith('%cEventEmitter at ')).toBe(true);
    expect(errorMessage).toBe(`${emitErrorName}: ${emitErrorTestMessage}`);
  });

  // * This test relies on three previous tests
  test('printLogs() should call console.warn/error w/ log.message of each log in Logger.#logs', () => {
    Logger.printLogs();

    expect(consoleWarnMock).toBeCalledTimes(2);
    expect(consoleErrorMock).toBeCalledTimes(1);
  });

  test('deleteLogs() prints info message & erases logs[], so printLogs() will emit nothing', () => {
    Logger.deleteLogs();

    expect(consoleInfoMock.mock.lastCall).toContain('%cAll Logger\'s logs has been deleted');

    Logger.printLogs();

    expect(consoleWarnMock).not.toBeCalled();
    expect(consoleErrorMock).not.toBeCalled();
  });
});
