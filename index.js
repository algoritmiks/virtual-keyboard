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
    this._shiftActive = false;
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
      this._keys[key].keyDOM.innerText = this._keys[key][this._currentLanguage].regular;
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
    for (let key in this._keys) {
      let currentKey = this._keys[key];
      if ( !currentKey[this._currentLanguage].shifted && this._capsLockActive ) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toUpperCase();
      }
      if ( !currentKey[this._currentLanguage].shifted && !this._capsLockActive ) {
        currentKey.keyDOM.innerText = currentKey.keyDOM.innerText.toLowerCase();
      }
    }
  }

  addActiveCSS( keyCode ) {
    this._keys[keyCode].keyDOM.classList.add("active");
  }

  removeActiveCSS( keyCode ) {
    this._keys[keyCode].keyDOM.classList.remove("active");
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

const onMouseUp = (e) => {
  if (e.target.classList.contains("button")) {
    if (e.target.innerText === "CapsLock") {
      state.changeCapsLockActive();
    } else {
      textarea.value += e.target.innerText;
    }
    
  }
}

keyboard.addEventListener('mouseup', onMouseUp);


let pressedKeys = new Set();

document.addEventListener('keydown', key => {
  if (!key.repeat) {
    if ( key.code === "CapsLock" ) {
      state.changeCapsLockActive();
    }
  state.addActiveCSS(key.code);
  
  pressedKeys.add(key.code);
  }
  
  
  textarea.value =  `key - ${key.key}, code - ${key.code}, charcode ${key.charCode}`;
});


document.addEventListener('keyup', key => {
  let keys = [];
  pressedKeys.forEach((el)=>{
    keys.push(el);
  })
  if (keys.includes("ControlLeft") && keys.includes("AltLeft")) {
    state.changeLanguage();
  }
  
  console.log(pressedKeys);
  state.removeActiveCSS(key.code);
  pressedKeys.delete(event.code);
});

window.state = state;