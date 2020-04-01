import { data } from './data/data.js';
   
const wrapper = document.createElement("div");
wrapper.classList.add("wrapper");
document.querySelector("body").appendChild(wrapper);

const textarea = document.createElement("textarea");
textarea.classList.add("textarea");
wrapper.appendChild(textarea);

const keyboard = document.createElement("div");
keyboard.classList.add("keyboard");
wrapper.appendChild(keyboard);


class State {
  constructor( data ) {
    this._currentLanguage = this.getStoredLanguage();
    this._capsLockActive = false;
    this._keys = {};
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
    localStorage.setItem("keyboardLanguage", this._currentLanguage);
  }

  initKeys( data ) {
    data.forEach( el => {
      this._keys[el.code] = new Key( el, this._currentLanguage );
    })
  }

  updateKeysLanguage() {
    for (let key in this._keys) {
      this._keys[key].keyDOM.innerText = this._keys[key][`${this._currentLanguage}Regular`];
    }
  }

  changeLanguage() {
    if (this._currentLanguage === "en") {
      this._currentLanguage = "ru";
    } else {
      this._currentLanguage = "en";
    }
    this.setStoredLanguage();
    this.updateKeysLanguage();
    this.changeKeysCase();
  }

  changeCapsLockActive() {
    this._capsLockActive = !this._capsLockActive;
    this.changeKeysCase();
  }

  changeKeysCase() {
    const shifted = `${this._currentLanguage}Shifted`;
    for (let key in this._keys) {
      if ( !this._keys[key][shifted] && this._capsLockActive ) {
        this._keys[key].keyDOM.innerText = this._keys[key].keyDOM.innerText.toUpperCase();
      }
      if ( !this._keys[key][shifted] && !this._capsLockActive ) {
        this._keys[key].keyDOM.innerText = this._keys[key].keyDOM.innerText.toLowerCase();
      }
    }
  }
}


class Key {
  constructor( key, currentLanguage ) {
    this.enRegular = key.en.regular;
    this.enShifted = key.en.shifted ? key.en.shifted : false;
    this.ruRegular = key.ru.regular;
    this.ruShifted = key.ru.shifted ? key.ru.shifted : false;
    this.addKeyToDOM( key, currentLanguage );
  }

  addKeyToDOM( keyData, currentLanguage ) {
    let key = document.createElement("div");
    key.classList = keyData.classCSS;
    keyboard.appendChild(key);
    key.innerText = this[`${currentLanguage}Regular`];
    this.keyDOM = key;
  }
}



let state = new State( data );

const onMouseClick = (e) => {
  if (e.target.classList.contains("button")) {
    textarea.value += e.target.innerText;
  }
}

keyboard.addEventListener('click', onMouseClick);


let pressedKeys = new Set();
document.addEventListener('keydown', (key) => {
// document.addEventListener('keypress', (key) => {
  if ( key.code === "CapsLock" ) {
    if (!key.repeat) {
    state.changeCapsLockActive();
  }
  }
  pressedKeys.add(key.keyCode);
  textarea.value =  `key - ${key.key}, code - ${key.code}, charcode ${key.charCode}`;
});

window.state = state;