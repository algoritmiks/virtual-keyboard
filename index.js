import { data } from './modules/data.js';

const wrapper = document.createElement('div');
wrapper.classList.add('wrapper');
document.body.appendChild(wrapper);

const textarea = document.createElement('textarea');
textarea.classList.add('textarea');
textarea.placeholder = 'Layout change left Alt - left Ctrl';
wrapper.appendChild(textarea);

const keyboardWrapper = document.createElement('div');
keyboardWrapper.classList.add('keyboard');
wrapper.appendChild(keyboardWrapper);

class Key {
  constructor(key, currentLanguage) {
    this.ru = {};
    this.en = {};
    this.en.regular = key.en.regular;
    this.en.shifted = key.en.shifted ? key.en.shifted : false;
    this.ru.regular = key.ru.regular;
    this.ru.shifted = key.ru.shifted ? key.ru.shifted : false;
    this.special = !!key.special;
    this.addKeyToDOM(key, currentLanguage);
  }

  addKeyToDOM(keyData, currentLanguage) {
    const key = document.createElement('div');
    key.classList = keyData.classCSS;
    key.dataset.code = keyData.code;
    keyboardWrapper.appendChild(key);
    key.innerText = this[currentLanguage].regular;
    this.keyDOM = key;
  }
}

class Keyboard {
  constructor() {
    this.currentLanguage = this.getStoredLanguage();
    this.capsActive = false;
    this.shiftActive = false;
    this.keys = {};
    this.mouseShiftPressed = false;
    this.initKeys(data);
  }

  getStoredLanguage() {
    const localStorageLanguage = localStorage.getItem('keyboardLanguage');
    if (!localStorageLanguage) {
      localStorage.setItem('keyboardLanguage', 'en');
      return 'en';
    }
    return localStorageLanguage;
  }

  setStoredLanguage() {
    localStorage.setItem('keyboardLanguage', this.currentLanguage);
  }

  initKeys() {
    data.forEach((el) => {
      this.keys[el.code] = new Key(el, this.currentLanguage);
    });
  }

  updateKeysLanguage() {
    Object.keys(this.keys).forEach((key) => {
      this.keys[key].keyDOM.innerText = this.keys[key][this.currentLanguage].regular;
    });
  }

  changeLanguage() {
    if (this.currentLanguage === 'en') {
      this.currentLanguage = 'ru';
    } else {
      this.currentLanguage = 'en';
    }
    this.setStoredLanguage();
    this.updateKeysLanguage();
    this.toggleKeyCaps();
  }

  changecapsActive() {
    this.capsActive = !this.capsActive;
    this.toggleKeyCaps();
  }

  toggleKeyCaps() {
    Object.keys(this.keys).forEach((key) => {
      const currentKey = this.keys[key];
      if (!currentKey[this.currentLanguage].shifted && this.capsActive) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toUpperCase();
      }
      if (!currentKey[this.currentLanguage].shifted && !this.capsActive) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toLowerCase();
      }
    });
  }

  toggleKeyShift() {
    Object.keys(this.keys).forEach((key) => {
      const currentKey = this.keys[key];
      if (currentKey[this.currentLanguage].shifted) {
        if (this.shiftActive) {
          currentKey.keyDOM.innerText = currentKey[this.currentLanguage].shifted;
        } else {
          currentKey.keyDOM.innerText = currentKey[this.currentLanguage].regular;
        }
      } else {
        if ((this.shiftActive && this.capsActive) || (!this.shiftActive && !this.capsActive)) {
          currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toLowerCase();
        }
        if ((this.shiftActive && !this.capsActive) || (!this.shiftActive && this.capsActive)) {
          currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toUpperCase();
        }
      }
    });
  }

  addActiveCSS(keyCode) {
    this.keys[keyCode].keyDOM.classList.add('active');
  }

  removeActiveCSS(keyCode) {
    this.keys[keyCode].keyDOM.classList.remove('active');
  }

  removeActiveCSSFromAllKeys() {
    Object.keys(this.keys).forEach((key) => {
      this.removeActiveCSS(key);
    });
  }

  changeShiftActive() {
    this.shiftActive = !this.shiftActive;
    this.toggleKeyShift();
  }

  specialKeysHandle(keyCode, repeat) {
    if (keyCode === 'Space') {
      this.addSymbolToTextarea(' ');
    }

    if (keyCode === 'Tab') {
      this.addSymbolToTextarea('\t');
    }

    if (keyCode === 'Enter') {
      this.addSymbolToTextarea('\n');
    }

    if (keyCode === 'Backspace') {
      const currentCarriagePosition = textarea.selectionStart;
      if (currentCarriagePosition > 0) {
        textarea.value = `${textarea.value.substring(0, textarea.selectionStart - 1)}${textarea.value.substring(textarea.selectionStart)}`;
        textarea.selectionStart = currentCarriagePosition - 1;
        textarea.selectionEnd = currentCarriagePosition - 1;
      }
    }

    if (keyCode === 'Delete') {
      const currentCarriagePosition = textarea.selectionStart;
      const endSelected = textarea.selectionEnd;
      if (currentCarriagePosition === endSelected) {
        textarea.value = `${textarea.value.substring(0, textarea.selectionStart)}${textarea.value.substring(textarea.selectionStart + 1)}`;
      } else {
        textarea.value = `${textarea.value.substring(0, textarea.selectionStart)}${textarea.value.substring(endSelected)}`;
      }
      textarea.selectionStart = currentCarriagePosition;
      textarea.selectionEnd = currentCarriagePosition;
    }

    if ((keyCode === 'ShiftLeft' || keyCode === 'ShiftRight')) {
      if (this.shiftActive) {
        this.addActiveCSS(keyCode);
      } else {
        this.changeShiftActive();
      }
    }

    if (keyCode === 'CapsLock' && !repeat) {
      this.changecapsActive();
    }

    if (keyCode === 'ArrowLeft') {
      if (textarea.selectionStart > 0) {
        textarea.selectionStart -= 1;
        textarea.selectionEnd -= 1;
      }
    }

    if (keyCode === 'ArrowRight') {
      textarea.selectionStart += 1;
    }
  }

  addSymbolToTextarea(symbol) {
    const currentCarriagePosition = textarea.selectionStart;
    textarea.value = `${textarea.value.substring(0, textarea.selectionStart)}${symbol}${textarea.value.substring(textarea.selectionStart)}`;
    textarea.selectionStart = currentCarriagePosition + 1;
    textarea.selectionEnd = currentCarriagePosition + 1;
  }
}

const keyboard = new Keyboard(data);
const pressedKeys = new Set();

const onMouseUp = () => {
  if (keyboard.mouseShiftPressed) {
    keyboard.mouseShiftPressed = false;
    keyboard.changeShiftActive();
  }
  keyboard.removeActiveCSSFromAllKeys();
  textarea.focus({ preventScroll: true });
};

window.addEventListener('mouseup', onMouseUp);

const onMouseDown = (e) => {
  if (e.target.classList.contains('button')) {
    let pressedKey = e.target.dataset.code;
    keyboard.addActiveCSS(pressedKey);
    if (pressedKey === 'ShiftLeft' || pressedKey === 'ShiftRight') {
      keyboard.mouseShiftPressed = true;
    }
    pressedKey = keyboard.keys[e.target.dataset.code];
    if (!pressedKey.special) {
      keyboard.addSymbolToTextarea(pressedKey.keyDOM.innerText);
    } else {
      keyboard.specialKeysHandle(e.target.dataset.code, false);
    }
  }
};

keyboardWrapper.addEventListener('mousedown', onMouseDown);

const onKeyDown = (key) => {
  key.preventDefault();
  if (keyboard.keys[key.code]) {
    if (!key.repeat) {
      keyboard.addActiveCSS(key.code);
      pressedKeys.add(key.code);
    }
    if (!keyboard.keys[key.code].special) {
      keyboard.addSymbolToTextarea(keyboard.keys[key.code].keyDOM.innerText);
    } else {
      keyboard.specialKeysHandle(key.code, key.repeat);
    }
  }
};

document.addEventListener('keydown', onKeyDown);

const onKeyUp = (key) => {
  if (keyboard.keys[key.code]) {
    const keys = [];
    pressedKeys.forEach((el) => {
      keys.push(el);
    });
    if (keys.includes('ControlLeft') && keys.includes('AltLeft') && keys.length === 2) {
      keyboard.changeLanguage();
    }
    if (key.key === 'Shift') {
      keyboard.changeShiftActive();
    }
    keyboard.removeActiveCSS(key.code);
    pressedKeys.delete(key.code);
    textarea.focus({ preventScroll: true });
  }
};

document.addEventListener('keyup', onKeyUp);

const onload = () => {
  textarea.focus();
};

window.onload = onload;
