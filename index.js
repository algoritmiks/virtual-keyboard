import { data } from './data/data.js';
   
const wrapper = document.createElement("div");
wrapper.classList.add("wrapper");
document.body.appendChild(wrapper);

const textarea = document.createElement("textarea");
textarea.classList.add("textarea");
wrapper.appendChild(textarea);

const keyboard = document.createElement("div");
keyboard.classList.add("keyboard");
wrapper.appendChild(keyboard);


class State {
  constructor( data ) {
    this.currentLanguage = this.getStoredLanguage();
    this.capsLockActive = false;
    this.shiftActive = false;
    this.keys = {};
    this.initKeys( data );
  }

  getStoredLanguage() {
    let localStorageLanguage = localStorage.getItem("keyboardLanguage");
    if (!localStorageLanguage) {
      localStorage.setItem("keyboardLanguage", "en");
      return "en";
    } 
    return localStorageLanguage;
  }

  setStoredLanguage() {
    localStorage.setItem("keyboardLanguage", this.currentLanguage);
  }

  initKeys( data ) {
    data.forEach( el => {
      this.keys[el.code] = new Key( el, this.currentLanguage );
    })
  }

  updateKeysLanguage() {
    for (let key in this.keys) {
      this.keys[key].keyDOM.innerText = this.keys[key][this.currentLanguage].regular;
    }
  }

  changeLanguage() {
    if (this.currentLanguage === "en") {
      this.currentLanguage = "ru";
    } else {
      this.currentLanguage = "en";
    }
    this.setStoredLanguage();
    this.updateKeysLanguage();
    this.toggleKeyCaps();
  }

  changeCapsLockActive() {
    this.capsLockActive = !this.capsLockActive;
    this.toggleKeyCaps();
  }

  toggleKeyCaps() {
    for (let key in this.keys) {
      let currentKey = this.keys[key];
      if ( !currentKey[this.currentLanguage].shifted && this.capsLockActive ) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toUpperCase();
      }
      if ( !currentKey[this.currentLanguage].shifted && !this.capsLockActive ) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toLowerCase();
      }
    }
  }

  toggleKeyShift() {
    for (let key in this.keys) {
      let currentKey = this.keys[key];
      if (currentKey[this.currentLanguage].shifted) {
        if (this.shiftActive) {
          currentKey.keyDOM.innerText = currentKey[this.currentLanguage].shifted;
        } else {
          currentKey.keyDOM.innerText = currentKey[this.currentLanguage].regular;
        }
      } else {
        if ((this.shiftActive && this.capsLockActive) || (!this.shiftActive && !this.capsLockActive)) {
          currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toLowerCase();
        }
        if ((this.shiftActive && !this.capsLockActive) || (!this.shiftActive && this.capsLockActive)) {
          currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toUpperCase();
        }
      }
    }
  }

  addActiveCSS( keyCode ) {
    this.keys[keyCode].keyDOM.classList.add("active");
  }

  removeActiveCSS( keyCode ) {
    this.keys[keyCode].keyDOM.classList.remove("active");
  }

  changeShiftActive() {
    this.shiftActive = !this.shiftActive;
    this.toggleKeyShift();
  }

  specialKeysHandle( keyCode, repeat ) {
    if (keyCode === "Space") {
      textarea.value += " ";
    }

    if (keyCode === "Tab") {
      textarea.value += "\t";
    }

    if (keyCode === "Enter") {
      textarea.value += "\n";
    }

    if (keyCode === "Backspace") {
      let currentCarriagePosition = textarea.selectionStart;
      textarea.value = `${textarea.value.substring(0, textarea.selectionStart-1)}${textarea.value.substring(textarea.selectionStart)}`;
      textarea.selectionStart = currentCarriagePosition-1;
      textarea.selectionEnd = currentCarriagePosition-1;
    }

    if (keyCode === "Delete") {
      let currentCarriagePosition = textarea.selectionStart;
      textarea.value = `${textarea.value.substring(0, textarea.selectionStart)}${textarea.value.substring(textarea.selectionStart+1)}`;
      textarea.selectionStart = currentCarriagePosition;
      textarea.selectionEnd = currentCarriagePosition;
    }

    if ( (keyCode === "ShiftLeft" || keyCode === "ShiftRight") && !repeat) {
      this.changeShiftActive();
    }

    if ( keyCode === "CapsLock" && !repeat) {
      this.changeCapsLockActive();
    }

    if ( keyCode === "ArrowLeft" ) {
      if ( textarea.selectionStart > 0 ) {
      textarea.selectionStart = textarea.selectionStart - 1;
      textarea.selectionEnd = textarea.selectionEnd - 1;
      }
    }

    if ( keyCode === "ArrowRight" ) {
      textarea.selectionStart = textarea.selectionStart + 1;
    }
  }
}

class Key {
  constructor( key, currentLanguage ) {
    this.ru = {};
    this.en = {};
    this.en.regular = key.en.regular;
    this.en.shifted = key.en.shifted ? key.en.shifted : false;
    this.ru.regular = key.ru.regular;
    this.ru.shifted = key.ru.shifted ? key.ru.shifted : false;
    this.special = key.special ? true : false;
    this.addKeyToDOM( key, currentLanguage );
  }

  addKeyToDOM( keyData, currentLanguage ) {
    let key = document.createElement("div");
    key.classList = keyData.classCSS;
    keyboard.appendChild(key);
    key.innerText = this[currentLanguage].regular;
    this.keyDOM = key;
  }
}


let state = new State( data );
let pressedKeys = new Set();

const onMouseUp = (e) => {
  if (e.target.classList.contains("button")) {
    if (e.target.innerText === "CapsLock") {
      state.changeCapsLockActive();
    } else {
      textarea.value += e.target.innerText;
    }
  }
  textarea.focus();
}

keyboard.addEventListener('mouseup', onMouseUp);


const onKeyDown = (key) => {
  key.preventDefault();
  if (state.keys[key.code]) {
    if (!key.repeat) {
      state.addActiveCSS(key.code);
      pressedKeys.add(key.code);
    }
    if (!state.keys[key.code].special) {
      textarea.value += state.keys[key.code].keyDOM.innerText;
    } else {
      state.specialKeysHandle(key.code, key.repeat);
    }

  }
};

document.addEventListener('keydown', onKeyDown);

const onKeyUp = (key) => {
  if (state.keys[key.code]) {
    let keys = [];
    pressedKeys.forEach((el) => {
      keys.push(el);
    })
    if (keys.includes("ControlLeft") && keys.includes("AltLeft") && keys.length == 2) {
      state.changeLanguage();
    }
    if (key.key === "Shift") {
      state.changeShiftActive();
    };
    state.removeActiveCSS(key.code);
    pressedKeys.delete(key.code);
    textarea.focus();
  }
};

document.addEventListener('keyup', onKeyUp);

const onload = () => {
  textarea.focus();
}
window.onload = onload;
