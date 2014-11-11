var Draw = {
    masterDiv: document.getElementById('master'),
    currentBackground: null,
    isMouseDown: false,
    mouseE: null,
    windowHeight: null,
    windowWidth: null,
    divHeight: 10,
    divWidth: 10,
    totalPixels: null,
    leftMouseColor: 'black',
    rightMouseColor: 'white',

    loaded: function () {
        var i = 0,
            div = null;
        Draw.windowHeight = window.innerHeight;
        Draw.windowWidth = window.innerWidth;
        Draw.totalPixels = Draw.windowHeight * Draw.windowWidth / 100;
        for (i; i < Draw.totalPixels; i++) {
            div = document.createElement('div');
            div.id = 'id' + i;
            Draw.masterDiv.appendChild(div);
        }
        Draw.listeners();
        Draw.buttonListeners();
    },

    listeners: function () {
        var thing = Draw.masterDiv.getElementsByTagName('div'),
            div = null,
            i = 0;
        for (i; i < thing.length; i++) {
            div = document.getElementById(thing[i].id);
            div.addEventListener('mouseover', function () {
                Draw.checkForAdd(this);
            });
            div.addEventListener('mousedown', function (e) {
                switch (e.which) {
                case 1:
                    Draw.leftClick(this);
                    break;
                case 3:
                    Draw.rightClick(this);
                    break;
                }
            });
        }

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        document.addEventListener('mousedown', function (e) {
            e.preventDefault();
            Draw.isMouseDown = true;
            Draw.mouseE = e;
        });
        document.addEventListener('mouseup', function (e) {
            e.preventDefault();
            Draw.isMouseDown = false;
            Draw.mouseE = e;
        });
    },

    buttonListeners: function () {
        var list = document.getElementsByClassName('paletteButtons'),
            length = list.length,
            i = 0;
        for (i = 0, length; i < length; i++) {
            list[i].addEventListener('mousedown', function (e) {
                switch (e.which) {
                case 1:
                    Draw.paletteButtonPressed(this.id, 'left');
                    break;
                case 3:
                    Draw.paletteButtonPressed(this.id, 'right');
                    break;
                }
                e.preventDefault();
            }, false);
        }
    },

    paletteButtonPressed: function (id, button) {
        var leftColor = document.getElementById('leftColor'),
            rightColor = document.getElementById('rightColor');
        if (id === 'Clear') {
            var thing = Draw.masterDiv.getElementsByTagName('div'),
                div = null,
                i = 0;
            for (i; i < thing.length; i++) {
                div = document.getElementById(thing[i].id);
                div.removeAttribute('style');
            }
        }
        if (button === 'left') {
            Draw.leftMouseColor = id;
            leftColor.value = id;
        }

        if (button === 'right') {
            Draw.rightMouseColor = id;
            rightColor.value = id;
        }
    },

    checkForAdd: function (div) {
        Draw.currentBackground = div.style.background;
        div.style.background = Draw.leftMouseColor;
        div.addEventListener('mouseout', function () {
            div.style.background = Draw.currentBackground;
        });

        Draw.leftMouseColor = document.getElementById('leftColor').value;
        Draw.rightMouseColor = document.getElementById('rightColor').value;

        if (Draw.isMouseDown) {
            if (Draw.mouseE.which === 1) {
                Draw.leftClick(div);
            }
            if (Draw.mouseE.which === 3) {
                Draw.rightClick(div);
            }
        }
    },

    leftClick: function (div) {
        div.style.background = Draw.leftMouseColor;
        Draw.currentBackground = Draw.leftMouseColor;
    },

    rightClick: function (div) {
        div.style.background = Draw.rightMouseColor;
        Draw.currentBackground = Draw.rightMouseColor;
    }
};

window.addEventListener('load', function loaded() {
    Draw.loaded();
}, false);