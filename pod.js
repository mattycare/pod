var Draw = {
    masterDiv: document.getElementById('master'),
    currentBackground: null,
    isMouseDown: false,
    mouseE: null,
    windowHeight: null,
    windowWidth: null,
    remainderPixels: null,
    totalPixels: null,
    leftMouseColor: null,
    rightMouseColor: null,
    zoomValue: 100,
    undoArray: [],
    tempUndoArray: [],
    redoArray: [],
    redoCount: 0,

    loaded: function () {
        var i = 0,
            div = null;
        Draw.windowHeight = Math.floor(window.innerHeight / 10) * 10;
        Draw.windowWidth = Math.floor(window.innerWidth / 10) * 10;
        Draw.totalPixels = (Draw.windowHeight * Draw.windowWidth / 100);
        document.body.style.height = Draw.windowHeight + 'px';
        document.body.style.width = Draw.windowWidth + 'px';
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
            Draw.attachListener(div);
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
            Draw.saveState();
        });
    },

    attachListener: function (div) {
        div.addEventListener('mouseover', function () {
            Draw.checkForAdd(div);
        });
        div.addEventListener('mousedown', function (e) {
            switch (e.which) {
            case 1:
                Draw.leftClick(div);
                break;
            case 3:
                Draw.rightClick(div);
                break;
            }
        });
    },

    attachButtonListeners: function (i) {
        var list = document.getElementsByClassName('paletteButtons');
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
    },

    buttonListeners: function () {
        var list = document.getElementsByClassName('paletteButtons'),
            length = list.length,
            i = 0,
            zoomOut = document.getElementById('zoomOut'),
            zoomIn = document.getElementById('zoomIn'),
            undo = document.getElementById('undo'),
            redo = document.getElementById('redo');
        for (i = 0, length; i < length; i++) {
            Draw.attachButtonListeners(i);
        }
        zoomIn.addEventListener('click', function () {
            Draw.zoom('in');
        });
        zoomOut.addEventListener('click', function () {
            Draw.zoom('out');
        });
        undo.addEventListener('click', function () {
            Draw.undoButtonPressed();
        });
        redo.addEventListener('click', function () {
            Draw.redoButtonPressed();
        });
    },

    zoom: function (direction) {
        if (direction === 'in') {
            Draw.zoomValue += 50;
        }
        if (direction === 'out' && Draw.zoomValue > 100) {
            Draw.zoomValue -= 50;
        }
        //window.scrollTo(Number(document.body.style.width.replace('px', '')) * 0.5, Number(document.body.style.height.replace('px', '') * 0.5))
        Draw.masterDiv.style.zoom = Draw.zoomValue + '%';
        document.body.style.width = Draw.windowWidth * Draw.zoomValue / 100 + 'px';
    },

    paletteButtonPressed: function (id, button) {
        var leftColor = document.getElementById('leftColor'),
            rightColor = document.getElementById('rightColor'),
            thing = Draw.masterDiv.getElementsByTagName('div'),
            div = null,
            i = 0;
        if (id === 'Clear') {
            for (i; i < thing.length; i++) {
                div = document.getElementById(thing[i].id);
                div.removeAttribute('style');
            }
            Draw.undoArray = [];
            Draw.redoArray = [];
            Draw.undoCount = 0;
        } else if (button === 'left') {
            Draw.leftMouseColor = id;
            leftColor.value = id;
        } else if (button === 'right') {
            Draw.rightMouseColor = id;
            rightColor.value = id;
        }
    },

    checkForAdd: function (div) {
        Draw.currentBackground = div.style.background;
        if (Draw.currentBackground === '') {
            Draw.currentBackground = 'rgb(255,255,255)';
        }
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

    saveState: function () {
        if (Draw.tempUndoArray.length > 0) {
            Draw.undoArray.push(Draw.tempUndoArray);
            Draw.tempUndoArray = [];
            Draw.redoArray = [];
        }
    },

    undoButtonPressed: function () {
        var position = Draw.undoArray.length - 1,
            store = null,
            undoLength = null,
            i = 0,
            color = null,
            div = null;
        if (Draw.undoArray.length > 0) {
            store = Draw.undoArray[position];
            undoLength = store.length;
            for (i; i < undoLength; i++) {
                color = store[i][0];
                div = document.getElementById(store[i][1].id);
                div.style.background = color;
            }
            Draw.redoArray.push(Draw.undoArray.pop());
        }
    },

    redoButtonPressed: function () {
        var store = null,
            redoLength = null,
            i = 0,
            color = null,
            div = null;
        if (Draw.redoArray.length > 0) {
            store = Draw.redoArray[Draw.redoArray.length - 1];
            redoLength = store.length;
            for (i; i < redoLength; i++) {
                color = store[i][2];
                div = document.getElementById(store[i][1].id);
                div.style.background = color;
            }
            if (Draw.undoCount > 0) {
                Draw.undoCount -= 1;
            }
            Draw.undoArray.push(Draw.redoArray.pop());
        }
    },

    rgbToHex: function (color) {
        if (color.charAt(0) === 'r') {
            color = color.replace('rgb(', '').replace(')', '').split(',');
            var r = parseInt(color[0], 10).toString(16),
                g = parseInt(color[1], 10).toString(16),
                b = parseInt(color[2], 10).toString(16),
                hex = null;
            r = r.length === 1 ? '0' + r : r;
            g = g.length === 1 ? '0' + g : g;
            b = b.length === 1 ? '0' + b : b;
            hex = '#' + r + g + b;
            return hex;
        }
    },

    leftClick: function (div) {
        if (Draw.rgbToHex(Draw.currentBackground) !== Draw.leftMouseColor) {
            Draw.tempUndoArray.push([Draw.currentBackground, div, Draw.leftMouseColor]);
        }
        div.style.background = Draw.leftMouseColor;
        Draw.currentBackground = Draw.leftMouseColor;
    },

    rightClick: function (div) {
        if (Draw.rgbToHex(Draw.currentBackground) !== Draw.rightMouseColor) {
            Draw.tempUndoArray.push([Draw.currentBackground, div, Draw.rightMouseColor]);
        }
        div.style.background = Draw.rightMouseColor;
        Draw.currentBackground = Draw.rightMouseColor;
    }
};

window.addEventListener('load', function loaded() {
    Draw.loaded();
}, false);