/*jslint browser:true */
var Draw = {
    MAXMOUSESIZE: 1,
    MINMOUSESIZE: 0,
    MASTERDIV: document.getElementById('master'),
    currentBackground: null,
    currentLeftBackground: null,
    currentRightBackground: null,
    currentTopBackground: null,
    currentBottomBackground: null,
    isMouseDown: false,
    windowHeight: null,
    windowWidth: null,
    remainderPixels: null,
    totalPixels: null,
    leftMouseColor: null,
    rightMouseColor: null,
    currentMouseColor: null,
    zoomValue: 100,
    undoArray: [],
    tempUndoArray: [],
    redoArray: [],
    redoCount: 0,
    mouseSize: 0,
    mouseButton: null,
    savedDrawing: [],
    calculateSurroundingObject: {},

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
            div.id = 'id' + (i + 1);
            div.style.background = 'rgb(255,255,255)';
            Draw.MASTERDIV.appendChild(div);
        }
        Draw.leftMouseColor = document.getElementById('leftColor').value;
        Draw.rightMouseColor = document.getElementById('rightColor').value;
        Draw.currentMouseColor = Draw.leftMouseColor;
        Draw.listeners();
        Draw.buttonListeners();
    },

    listeners: function () {
        var thing = Draw.MASTERDIV.getElementsByTagName('div'),
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
            Draw.mouseButton = e.which;
        });
        document.addEventListener('mouseup', function (e) {
            e.preventDefault();
            Draw.isMouseDown = false;
            Draw.currentMouseColor = Draw.leftMouseColor;
            Draw.saveState();
        });
        // document.addEventListener('keydown', function (e) {
        //     if ((e.keyCode === 90 || e.which === 90) && e.ctrlKey) {
        //         Draw.undoButtonPressed();
        //     }
        // });
        // document.addEventListener('keydown', function (e) {
        //     if (e.keyCode === 221 || e.which === 221) {
        //         if (Draw.mouseSize < Draw.MAXMOUSESIZE) {
        //             Draw.mouseSize += 1;
        //         }
        //     }
        // });
    },

    attachListener: function (div) {
        div.addEventListener('mouseover', function () {
            var surroundingPixels = Draw.calculateSurrounding(div);
            Draw.mouseOver(surroundingPixels);
        });

        div.addEventListener('mouseout', function () {
            var surroundingPixels = Draw.calculateSurrounding(div);
            Draw.mouseOut(surroundingPixels);
        });

        div.addEventListener('mousedown', function (e) {
            var surroundingPixels = Draw.calculateSurrounding(div);
            Draw.mouseButton = e.which;
            Draw.mouseDown(surroundingPixels);
        });
        // div.addEventListener('mouseup', function () {
        //     var surroundingPixels = Draw.calculateSurrounding(div);
        //     //Draw.mouseUp(surroundingPixels);
        // });
    },

    buttonListeners: function () {
        var list = document.getElementsByClassName('paletteButtons'),
            length = list.length,
            i = 0,
            clearDrawing = document.getElementById('clear'),
            zoomOut = document.getElementById('zoomOut'),
            zoomIn = document.getElementById('zoomIn'),
            undo = document.getElementById('undo'),
            redo = document.getElementById('redo'),
            leftMouseColor = document.getElementById('leftColor'),
            rightMouseColor = document.getElementById('rightColor'),
            increase = document.getElementById('increaseMouse'),
            decrease = document.getElementById('decreaseMouse'),
            save = document.getElementById('save'),
            load = document.getElementById('load');
        for (i = 0, length; i < length; i++) {
            Draw.attachButtonListeners(i);
        }

        clearDrawing.addEventListener('click', function () {
            Draw.clearDrawing();
        });
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
        leftMouseColor.addEventListener('change', function () {
            Draw.leftMouseColor = leftMouseColor.value;
        });
        rightMouseColor.addEventListener('change', function () {
            Draw.rightMouseColor = rightMouseColor.value;
        });
        increase.addEventListener('click', function () {
            if (Draw.mouseSize < Draw.MAXMOUSESIZE) {
                Draw.mouseSize += 1;
            }
        });
        decrease.addEventListener('click', function () {
            if (Draw.mouseSize > Draw.MINMOUSESIZE) {
                Draw.mouseSize -= 1;
            }
        });
        save.addEventListener('click', function () {
            Draw.saveButtonPressed();
        });
        load.addEventListener('click', function () {
            Draw.loadButtonPressed();
        });
    },

    attachButtonListeners: function (i) {
        var list = document.getElementsByClassName('paletteButtons');
        list[i].addEventListener('mousedown', function (e) {
            switch (e.which) {
            case 1:
                Draw.mouseButton = 1;
                Draw.paletteButtonPressed(this.id);
                break;
            case 3:
                Draw.mouseButton = 3;
                Draw.paletteButtonPressed(this.id);
                break;
            }
            e.preventDefault();
        }, false);
    },

    zoom: function (direction) {
        if (direction === 'in') {
            Draw.zoomValue += 50;
        }
        if (direction === 'out' && Draw.zoomValue > 100) {
            Draw.zoomValue -= 50;
        }
        Draw.MASTERDIV.style.zoom = Draw.zoomValue + '%';
        document.body.style.width = Draw.windowWidth * Draw.zoomValue / 100 + 'px';
    },

    paletteButtonPressed: function (id) {
        var leftColor = document.getElementById('leftColor'),
            rightColor = document.getElementById('rightColor');
           
        switch (Draw.mouseButton) {
            case 1:
                Draw.leftMouseColor = id;
                leftColor.value = id;
                break;
            case 3:
                Draw.rightMouseColor = id;
                rightColor.value = id;
                break;
        }
    },

    clearDrawing: function () {
        var i = 0,
            elementsToClear = Draw.MASTERDIV.getElementsByTagName('div'),
            div = null;
         for (i; i < elementsToClear.length; i++) {
            div = document.getElementById(elementsToClear[i].id);
            div.removeAttribute('style');
        }
        Draw.undoArray = [];
        Draw.redoArray = [];
        Draw.undoCount = 0;
        Draw.redoCount = 0;
    },

    mouseOver: function (pixels) {
        Draw.currentBackground = pixels.centerPixel.style.background;
        pixels.centerPixel.style.background = Draw.currentMouseColor;

        if (Draw.mouseSize === 1) {
            if (pixels.topPixel !== null) {
                Draw.currentTopBackground = pixels.topPixel.style.background;
            }
            if (pixels.bottomPixel !== null) {
                Draw.currentBottomBackground = pixels.bottomPixel.style.background;
            }

            if (pixels.farthestLeft) {
                Draw.currentLeftBackground = pixels.leftPixel.style.background;
                pixels.leftPixel.style.background = Draw.currentMouseColor;
            }

            if (pixels.farthestRight) {
                Draw.currentRightBackground = pixels.rightPixel.style.background;
                pixels.rightPixel.style.background = Draw.currentMouseColor;
            }

            if (pixels.topPixel !== null) {
                pixels.topPixel.style.background = Draw.currentMouseColor;
            }
            if (pixels.bottomPixel !== null) {
                pixels.bottomPixel.style.background = Draw.currentMouseColor;
            }
        }

        if (Draw.mouseSize === 1 && Draw.isMouseDown) {
            if (pixels.farthestLeft) {
                Draw.mouseClicked(pixels.leftPixel, 'left', Draw.currentMouseColor);
            }
            if (pixels.farthestRight) {
                Draw.mouseClicked(pixels.rightPixel, 'right', Draw.currentMouseColor);
            }
            Draw.mouseClicked(pixels.topPixel, 'top', Draw.currentMouseColor);
            Draw.mouseClicked(pixels.bottomPixel, 'bottom', Draw.currentMouseColor);
            Draw.mouseClicked(pixels.centerPixel, 'center', Draw.currentMouseColor);
        } else if (Draw.mouseSize === 0 && Draw.isMouseDown) {
            Draw.mouseClicked(pixels.centerPixel, 'center', Draw.currentMouseColor);
        }
    },

    mouseOut: function (pixels) {
        pixels.centerPixel.style.background = Draw.currentBackground;
        if (Draw.mouseSize === 1) {
            if (pixels.leftPixel !== null && pixels.farthestLeft) {
                pixels.leftPixel.style.background = Draw.currentLeftBackground;
            }
            if (pixels.rightPixel !== null && pixels.farthestRight) {
                pixels.rightPixel.style.background = Draw.currentRightBackground;
            }
            if (pixels.topPixel !== null) {
                pixels.topPixel.style.background = Draw.currentTopBackground;
            }
            if (pixels.bottomPixel !== null) {
                pixels.bottomPixel.style.background = Draw.currentBottomBackground;
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

    calculateSurrounding: function (div) {
        var divsWide = Math.floor(Draw.windowWidth / 10),
            divId = div.id,
            divNumber = divId.replace('id', ''),
            rowPosition = divNumber / divsWide,
            topPixel = document.getElementById('id' + Math.round(((rowPosition - 1) * divsWide))),
            rightPixel = null,
            bottomPixel = document.getElementById('id' + Math.round(((rowPosition + 1) * divsWide))),
            leftPixel = null,
            centerPixel = div,
            farthestLeft = false,
            farthestRight = false;
        if (divNumber > 1) {
            leftPixel = document.getElementById('id' + (Number(divNumber) - 1));
            farthestLeft = Number(leftPixel.id.replace('id', '')) % divsWide !== 0;
        }

        if (divNumber < Draw.totalPixels) {
            rightPixel = document.getElementById('id' + (Number(divNumber) + 1));
            farthestRight = Number(rightPixel.id.replace('id', '')) % divsWide !== 1;
        }

        return {
            topPixel: topPixel,
            rightPixel: rightPixel,
            bottomPixel: bottomPixel,
            leftPixel: leftPixel,
            centerPixel: centerPixel,
            farthestLeft: farthestLeft,
            farthestRight: farthestRight
        };
    },

    mouseDown: function (pixels) {
        switch (Draw.mouseButton) {
            case 1:
                Draw.currentMouseColor = Draw.leftMouseColor;
                break;
            case 3:
                Draw.currentMouseColor = Draw.rightMouseColor;
                break;
        }

        if (Draw.mouseSize === 0) {
            switch (Draw.mouseButton) {
            case 1:
                Draw.mouseClicked(pixels.centerPixel, 'center', Draw.currentMouseColor);
                break;
            case 3:
                Draw.mouseClicked(pixels.centerPixel, 'center', Draw.currentMouseColor);
                break;
            }
        }
        if (Draw.mouseSize === 1) {
            if (pixels.farthestLeft) {
                Draw.mouseClicked(pixels.leftPixel, 'left', Draw.currentMouseColor);
            }
            if (pixels.farthestRight) {
                Draw.mouseClicked(pixels.rightPixel, 'right', Draw.currentMouseColor);
            }
            Draw.mouseClicked(pixels.topPixel, 'top', Draw.currentMouseColor);
            Draw.mouseClicked(pixels.bottomPixel, 'bottom', Draw.currentMouseColor);
            Draw.mouseClicked(pixels.centerPixel, 'center', Draw.currentMouseColor);
        }
    },

    mouseClicked: function (div, location, mouseColor) {
        if (div !== null) {
            switch (location) {
            case 'left':
                if (Draw.rgbToHex(Draw.currentLeftBackground) !== mouseColor) {
                    Draw.tempUndoArray.push([Draw.currentLeftBackground, div, mouseColor]);
                }
                Draw.currentLeftBackground = mouseColor;
                break;

            case 'right':
                if (Draw.rgbToHex(Draw.currentRightBackground) !== mouseColor) {
                    Draw.tempUndoArray.push([Draw.currentRightBackground, div, mouseColor]);
                }
                Draw.currentRightBackground = mouseColor;
                break;

            case 'top':
                if (Draw.rgbToHex(Draw.currentTopBackground) !== mouseColor) {
                    Draw.tempUndoArray.push([Draw.currentTopBackground, div, mouseColor]);
                }
                Draw.currentTopBackground = mouseColor;
                break;

            case 'bottom':
                if (Draw.rgbToHex(Draw.currentBottomBackground) !== mouseColor) {
                    Draw.tempUndoArray.push([Draw.currentBottomBackground, div, mouseColor]);
                }
                Draw.currentBottomBackground = mouseColor;
                break;

            case 'center':
                if (Draw.rgbToHex(Draw.currentBackground) !== mouseColor) {
                    Draw.tempUndoArray.push([Draw.currentBackground, div, mouseColor]);
                }
                Draw.currentBackground = mouseColor;
                break;
            }
        }
    },

    saveButtonPressed: function () {
        Draw.savedDrawing = [];
        var undoLength = Draw.undoArray.length,
            i = undoLength - 1;
        for (i; i >= 0; i--) {
            Draw.savedDrawing.push(Draw.undoArray[i]);
        }
    },

    loadButtonPressed: function () {
        var saveArrayLength = Draw.savedDrawing.length,
            i = saveArrayLength - 1,
            j = 0,
            k = saveArrayLength - 1,
            store = null,
            saveLength = null,
            color = null,
            div = null;
        if (saveArrayLength > 0) {
            Draw.clearDrawing();
            for (i; i >= 0; i--) {
                store = Draw.savedDrawing[i];
                saveLength = store.length;
                j = 0;
                for (j; j < saveLength; j++) {
                    color = store[j][2];
                    div = document.getElementById(store[j][1].id);
                    div.style.background = color;
                }
            }
            Draw.undoCount = saveArrayLength;
            Draw.redoArray = [];
            Draw.redoCount = 0
            for (k; k >= 0; k--) {
                Draw.undoArray.push(Draw.savedDrawing[k]);
            }
        }
    }
};

window.addEventListener('load', function loaded() {
    Draw.loaded();
}, false);