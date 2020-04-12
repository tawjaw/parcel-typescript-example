import '@wokwi/elements';
import { buildHex } from './compile';
import { AVRRunner } from './execute';
import { formatTime } from './format-time';
import './index.css';
import { CPUPerformance } from './cpu-performance';
import { LEDElement } from '@wokwi/elements';
import { EditorHistoryUtil } from './utils/editor-history.util';
import "./RobotEnvironment";

let editor: any; // eslint-disable-line @typescript-eslint/no-explicit-any
const BLINK_CODE = `
#define rightMotor 13
#define leftMotor 12

void moveForward()
{  
  digitalWrite(rightMotor, HIGH);
  digitalWrite(leftMotor, HIGH);
}
void rotateRight()
{
  digitalWrite(rightMotor, LOW);
  digitalWrite(leftMotor, HIGH);
}
void rotateLeft()
{
  digitalWrite(rightMotor, HIGH);
  digitalWrite(leftMotor, LOW);
}
void stop()
{
  digitalWrite(rightMotor, LOW);
  digitalWrite(leftMotor, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(rightMotor, OUTPUT);
  pinMode(leftMotor, OUTPUT);

}
void loop() {
  moveForward();
  delay(5000);
  rotateRight();
  delay(7000);
  moveForward();
  delay(5000);
  rotateLeft();
  delay(2000);
  stop();
  delay(5000);
}`.trim();

// Load Editor
declare const window: any; // eslint-disable-line @typescript-eslint/no-explicit-any
declare const monaco: any; // eslint-disable-line @typescript-eslint/no-explicit-any
window.require.config({
  paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }
});
window.require(['vs/editor/editor.main'], () => {
  editor = monaco.editor.create(document.querySelector('.code-editor'), {
    value: EditorHistoryUtil.getValue() || BLINK_CODE,
    language: 'cpp',
    minimap: { enabled: false }
  });
});

// Set up LEDs
export const led13 = document.querySelector<LEDElement>('wokwi-led[color=green]');
export const led12 = document.querySelector<LEDElement>('wokwi-led[color=red]');

// Set up toolbar
let runner: AVRRunner;
let isRunning = false;

/* eslint-disable @typescript-eslint/no-use-before-define */
const runButton = document.querySelector('#run-button');
runButton.addEventListener('click', compileAndRun);
const stopButton = document.querySelector('#stop-button');
stopButton.addEventListener('click', stopCode);
const revertButton = document.querySelector('#revert-button');
revertButton.addEventListener('click', setBlinkSnippet);
const statusLabel = document.querySelector('#status-label');
const compilerOutputText = document.querySelector('#compiler-output-text');
const serialOutputText = document.querySelector('#serial-output-text');

function executeProgram(hex: string) {
  runner = new AVRRunner(hex);
  const MHZ = 16000000;

  // Hook to PORTB register
  runner.portB.addListener((value) => {
    const D12bit = 1 << 4;
    const D13bit = 1 << 5;
    //if(isRunning)
    {
      led12.value = value & D12bit ? true : false;
      led13.value = value & D13bit ? true : false;
    
    }
    /*else
    {
      led12.value = false;
      led13.value = false;
    }*/

    //console.log("leds ", led12.value, led13.value);
    //setMotorState(led12.value, led13.value);
      
  });
  runner.usart.onByteTransmit = (value) => {
    serialOutputText.textContent += String.fromCharCode(value);
  };
  const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
  runner.execute((cpu) => {
    const time = formatTime(cpu.cycles / MHZ);
    const speed = (cpuPerf.update() * 100).toFixed(0);
    statusLabel.textContent = `Simulation time: ${time} (${speed}%)`;
  });
}

async function compileAndRun() {
  led12.value = false;
  led13.value = false;

  storeUserSnippet();

  runButton.setAttribute('disabled', '1');
  revertButton.setAttribute('disabled', '1');

  serialOutputText.textContent = '';
  try {
    statusLabel.textContent = 'Compiling...';
    const result = await buildHex(editor.getModel().getValue());
    compilerOutputText.textContent = result.stderr || result.stdout;
    if (result.hex) {
      compilerOutputText.textContent += '\nProgram running...';
      stopButton.removeAttribute('disabled');
      executeProgram(result.hex);
      isRunning = true;
    } else {
      runButton.removeAttribute('disabled');
    }
  } catch (err) {
    runButton.removeAttribute('disabled');
    revertButton.removeAttribute('disabled');
    alert('Failed: ' + err);
  } finally {
    statusLabel.textContent = '';
  }
}

function storeUserSnippet() {
  EditorHistoryUtil.clearSnippet();
  EditorHistoryUtil.storeSnippet(editor.getValue());
}

function stopCode() {
  stopButton.setAttribute('disabled', '1');
  runButton.removeAttribute('disabled');
  revertButton.removeAttribute('disabled');
  if (runner) {
    runner.stop();
    runner = null;
    isRunning = false;
  }
}

function setBlinkSnippet() {
  editor.setValue(BLINK_CODE);
  EditorHistoryUtil.storeSnippet(editor.getValue());
}

