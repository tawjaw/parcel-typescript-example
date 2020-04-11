import '@wokwi/elements';
import { buildHex } from "./compile";
import { AVRRunner } from "./execute";
import { formatTime } from "./format-time";
import { LEDElement } from "@wokwi/elements";
import "./index.css";

const BLINK_CODE = `
// LEDs connected to pins 8..13

byte leds[] = {13, 12, 11, 10, 9, 8};
void setup() {
  for (byte i = 0; i < sizeof(leds); i++) {
    pinMode(leds[i], OUTPUT);
  }
}

int i = 0;
void loop() {
  digitalWrite(leds[i], HIGH);
  delay(250);
  digitalWrite(leds[i], LOW);
  i = (i + 1) % sizeof(leds);
}`.trim();

let editor;
declare const window: any;
declare const monaco: any;
window.editorLoaded = () => {
  window.require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.18.1/min/vs"
    }
  });
  window.require(["vs/editor/editor.main"], () => {
    editor = monaco.editor.create(document.querySelector(".code-editor"), {
      value: BLINK_CODE,
      language: "cpp",
      minimap: { enabled: false }
    });
  });
};

// Set up LEDs
const LEDs = document.querySelectorAll<LEDElement & HTMLElement>("wokwi-led");

// Set up toolbar
let runner: AVRRunner;

const runButton = document.querySelector("#run-button");
runButton.addEventListener("click", compileAndRun);
const stopButton = document.querySelector("#stop-button");
stopButton.addEventListener("click", stopCode);
const statusLabel = document.querySelector("#status-label");
const compilerOutputText = document.querySelector("#compiler-output-text");

function updateLEDs(value: number, startPin: number) {
  for (const led of LEDs) {
    const pin = parseInt(led.getAttribute("pin"), 10);
    if (pin >= startPin && pin <= startPin + 8) {
      led.value = value & (1 << (pin - startPin)) ? true : false;
    }
  }
}

function executeProgram(hex: string) {
  runner = new AVRRunner(hex);
  const MHZ = 16000000;

  // Hook to PORTB register
  runner.portD.addListener(value => {
    updateLEDs(value, 0);
  });
  runner.portB.addListener(value => {
    updateLEDs(value, 8);
  });
  runner.execute(cpu => {
    const time = formatTime(cpu.cycles / MHZ);
    statusLabel.textContent = "Simulation time: " + time;
  });
}

async function compileAndRun() {
  for (const led of LEDs) {
    led.value = false;
  }

  runButton.setAttribute("disabled", "1");
  try {
    statusLabel.textContent = "Compiling...";
    const result = await buildHex(editor.getModel().getValue());
    compilerOutputText.textContent = result.stderr || result.stdout;
    if (result.hex) {
      compilerOutputText.textContent += "\nProgram running...";
      stopButton.removeAttribute("disabled");
      executeProgram(result.hex);
    } else {
      runButton.removeAttribute("disabled");
    }
  } catch (err) {
    runButton.removeAttribute("disabled");
    alert("Failed: " + err);
  } finally {
    statusLabel.textContent = "";
  }
}

function stopCode() {
  stopButton.setAttribute("disabled", "1");
  runButton.removeAttribute("disabled");
  if (runner) {
    runner.stop();
    runner = null;
  }
}
