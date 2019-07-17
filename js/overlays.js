//=================================================================//
//                              view
//=================================================================//
let view = {
    updateHelloMenu : function(name) {
        let greetingField = document.querySelector('.menu .menu__greeting');
        if (name) {
           greetingField.innerHTML = `Добро пожаловать, ${name}`;
        }
        else if (!name) {
            greetingField.innerHTML = `Добро пожаловать, User`;
        }
    },
    openModalWindow: function(arg) {
        arg.classList.remove('modal_closed');
    },
    closeModalWindow: function(arg) {
        arg.classList.add('modal_closed');
    },
    clearInputs: function(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].value = '';
        }
    },
    highlightTheBorder: function(item, state) {
        if (state == true) {
            item.style.border = '1px gray solid';
        }
        else {
            item.style.border = '1px solid red';
        }    
    }
}

//=================================================================//
//                             model
//=================================================================//
let model = {
    inptArr : document.getElementsByTagName('input'),
    
    getData: function() {
        if (window.localStorage.getItem('userData')) {
            let userData = JSON.parse(window.localStorage.getItem('userData'));
            let name =  `${userData['name']}`;
            view.updateHelloMenu(name);
            return true;
        }
        else {
            view.updateHelloMenu();
            return false;
        }
    },
    clearField: function() {
        window.localStorage.removeItem('userData');
        model.getData();
    },
    openModal: function(arg) {
        if (Array.isArray(arg)) {
            for (let i = 0; i < arg.length; i++) {
                view.openModalWindow(arg[i]);
            }
        }
        else view.openModalWindow(arg);
    },
    closeModal: function(arg) {
        if (Array.isArray(arg)) {
            for (let i = 0; i < arg.length; i++) {
                view.closeModalWindow(arg[i]);
            }
        }
        else view.closeModalWindow(arg);
        view.clearInputs(model.inptArr);
    },
    validate: function(reg, data) {
        if (new RegExp(reg).test(data)) {
            return true;
        }
        return false;
    },
    saveData: function() {
        let inptArr = model.inptArr;
        let userData = {};
        for (let i = 0; i < inptArr.length; i++) {
            if (inptArr[i].value) {
                view.highlightTheBorder(inptArr[i], true);
                let reg = inptArr[i].getAttribute('data-regx');
                if (!model.validate(reg, inptArr[i].value)) {
                    view.highlightTheBorder(inptArr[i], false);
                    continue;
                }
                let name = inptArr[i].getAttribute('id');
                let val = inptArr[i].value;
                userData[name] = val;
            }
            else view.highlightTheBorder(inptArr[i], false);
        }
        if (Object.keys(userData).length == inptArr.length) {
            window.localStorage.setItem('userData', JSON.stringify(userData));
            model.getData();
            return true;
        }
    }
}
//+================================================================//
//                           controller
//=================================================================//
let overlayWindowBG = document.getElementById('modal-overlay'),
overlayWind = document.getElementById('modal');

let controller = {
    
    events: function() {
        let saveData = document.getElementById('modal-save'),
            close = document.getElementsByClassName('close');
            inputName = document.querySelector('.menu .menu__icons .menu__icons-info');
   
        saveData.addEventListener('click', function(e) {
            e.preventDefault();
            if(model.saveData()) {
                setTimeout(function() {
                    model.closeModal([overlayWindowBG, overlayWind])
                }, 1000);
            }
        });
        inputName.addEventListener('click', function(e) {
            e.preventDefault();
            model.openModal([overlayWindowBG, overlayWind]);
        });
   
        for (let i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function(e) {
                e.preventDefault();
                model.closeModal([overlayWindowBG, overlayWind]);
            });
        };
    },
    open: function() {
        model.openModal([overlayWindowBG, overlayWind]);
    }
}
function modalInit() {
    let data = model.getData();
    if (!data) {
        controller.open();
    }
    controller.events();
}