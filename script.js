const output = document.getElementById("output");
const history = document.getElementById("history");
const keys = document.querySelector(".keys");
const themeToggle = document.getElementById("themeToggle");

let current = "0";
let previous = null;
let operator = null;
let waitingForNew = false;

const updateDisplay = () => {
  output.textContent = current;
  const historyText =
    previous !== null && operator
      ? `${previous} ${operator}`
      : "";
  history.textContent = historyText || "\u00a0";
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "Error";
  const maxDigits = 12;
  const str = value.toString();
  if (str.length <= maxDigits) return str;
  return value.toExponential(6);
};

const applyOperator = (nextOperator) => {
  const inputValue = parseFloat(current);

  if (previous === null) {
    previous = inputValue;
  } else if (operator) {
    const result = calculate(previous, inputValue, operator);
    previous = result;
    current = formatNumber(result);
  }

  operator = nextOperator;
  waitingForNew = true;
  updateDisplay();
};

const calculate = (first, second, op) => {
  switch (op) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "*":
      return first * second;
    case "/":
      return second === 0 ? NaN : first / second;
    case "^":
      return Math.pow(first, second);
    default:
      return second;
  }
};

const handleFunction = (fn) => {
  const value = parseFloat(current);
  let result = value;

  switch (fn) {
    case "sin":
      result = Math.sin((value * Math.PI) / 180);
      break;
    case "cos":
      result = Math.cos((value * Math.PI) / 180);
      break;
    case "tan":
      result = Math.tan((value * Math.PI) / 180);
      break;
    case "ln":
      result = value <= 0 ? NaN : Math.log(value);
      break;
    case "log":
      result = value <= 0 ? NaN : Math.log10(value);
      break;
    case "sqrt":
      result = value < 0 ? NaN : Math.sqrt(value);
      break;
    case "pow2":
      result = value * value;
      break;
    case "pow3":
      result = value * value * value;
      break;
    case "inv":
      result = value === 0 ? NaN : 1 / value;
      break;
    default:
      break;
  }

  current = formatNumber(result);
  waitingForNew = true;
  updateDisplay();
};

const inputNumber = (num) => {
  if (waitingForNew) {
    current = num;
    waitingForNew = false;
  } else {
    current = current === "0" ? num : current + num;
  }
  updateDisplay();
};

const inputDecimal = () => {
  if (waitingForNew) {
    current = "0.";
    waitingForNew = false;
    updateDisplay();
    return;
  }
  if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
};

const toggleSign = () => {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
  updateDisplay();
};

const backspace = () => {
  if (waitingForNew) return;
  if (current.length <= 1 || (current.startsWith("-") && current.length === 2)) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
};

const toPercent = () => {
  const value = parseFloat(current);
  current = formatNumber(value / 100);
  updateDisplay();
};

const clearAll = () => {
  current = "0";
  previous = null;
  operator = null;
  waitingForNew = false;
  updateDisplay();
};

const insertConstant = (constant) => {
  const value = constant === "pi" ? Math.PI : Math.E;
  current = formatNumber(value);
  waitingForNew = true;
  updateDisplay();
};

const evaluate = () => {
  if (operator === null || previous === null) return;
  const inputValue = parseFloat(current);
  const result = calculate(previous, inputValue, operator);
  current = formatNumber(result);
  previous = null;
  operator = null;
  waitingForNew = true;
  updateDisplay();
};

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      applyOperator(value);
      break;
    case "equals":
      evaluate();
      break;
    case "clear":
      clearAll();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      toPercent();
      break;
    case "function":
      handleFunction(value);
      break;
    case "constant":
      insertConstant(value);
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (key >= "0" && key <= "9") {
    inputNumber(key);
    return;
  }

  if (key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/", "^"].includes(key)) {
    applyOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
    return;
  }

  if (key === "Escape") {
    clearAll();
    return;
  }

  if (key === "Backspace") {
    backspace();
    return;
  }

  if (key === "%") {
    toPercent();
    return;
  }

  if (key.toLowerCase() === "p") {
    insertConstant("pi");
    return;
  }

  if (key.toLowerCase() === "e") {
    insertConstant("e");
  }
});

const applyTheme = (mode) => {
  const isLight = mode === "light";
  document.body.classList.toggle("theme-light", isLight);
  themeToggle.setAttribute("aria-pressed", isLight.toString());
  themeToggle.textContent = isLight ? "Dark" : "Light";
};

const storedTheme = localStorage.getItem("cc-theme") || "dark";
applyTheme(storedTheme);

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("theme-light");
  const nextTheme = isLight ? "dark" : "light";
  localStorage.setItem("cc-theme", nextTheme);
  applyTheme(nextTheme);
});

updateDisplay();
