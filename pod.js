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
    mouseSize: 0,

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
            Draw.mouseE = e;
        });
        document.addEventListener('mouseup', function (e) {
            e.preventDefault();
            Draw.isMouseDown = false;
            Draw.mouseE = e;
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
            surroundingPixels = Draw.calculateSurrounding(div);
            Draw.mouseOver(surroundingPixels);
        });

        div.addEventListener('mouseout', function () {
            surroundingPixels = Draw.calculateSurrounding(div);
            Draw.mouseOut(surroundingPixels);
        });

        div.addEventListener('mousedown', function (e) {
            surroundingPixels = Draw.calculateSurrounding(div);
            mouseButton = e.which;
            Draw.mouseDown(surroundingPixels, mouseButton);
        });
    },

    buttonListeners: function () {
        var list = document.getElementsByClassName('paletteButtons'),
            length = list.length,
            i = 0,
            zoomOut = document.getElementById('zoomOut'),
            zoomIn = document.getElementById('zoomIn'),
            undo = document.getElementById('undo'),
            redo = document.getElementById('redo'),
            leftMouseColor = document.getElementById('leftColor'),
            rightMouseColor = document.getElementById('rightColor'),
            increase = document.getElementById('increaseMouse'),
            decrease = document.getElementById('decreaseMouse');
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

    zoom: function (direction) {
        if (direction === 'in') {
            Draw.zoomValue += 50;
        }
        if (direction === 'out' && Draw.zoomValue > 100) {
            Draw.zoomValue -= 50;
        }
        //window.scrollTo(Number(document.body.style.width.replace('px', '')) * 0.5, Number(document.body.style.height.replace('px', '') * 0.5))
        Draw.MASTERDIV.style.zoom = Draw.zoomValue + '%';
        document.body.style.width = Draw.windowWidth * Draw.zoomValue / 100 + 'px';
    },

    paletteButtonPressed: function (id, button) {
        var leftColor = document.getElementById('leftColor'),
            rightColor = document.getElementById('rightColor'),
            thing = Draw.MASTERDIV.getElementsByTagName('div'),
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

    mouseOver: function (pixels, mouseSize) {
        Draw.currentBackground = pixels[4].style.background;
        pixels[4].style.background = Draw.leftMouseColor;

        if (Draw.mouseSize === 1 ) {
            Draw.currentLeftBackground = pixels[3].style.background;
            Draw.currentRightBackground = pixels[1].style.background;
            if (pixels[0] !== null) {
                Draw.currentTopBackground = pixels[0].style.background;
            }
            if (pixels[2] !== null) {
                Draw.currentBottomBackground = pixels[2].style.background;
            }

            if (pixels[6]) {
                pixels[3].style.background = Draw.leftMouseColor;  
            }

            if(pixels[7]) {
                pixels[1].style.background = Draw.leftMouseColor;
            }

            if (pixels[0] !== null) {
                pixels[0].style.background = Draw.leftMouseColor;
            }
            if (pixels[2] !== null) {
                pixels[2].style.background = Draw.leftMouseColor;
            }
        }
        if (Draw.mouseSize === 0) {
            if (Draw.isMouseDown) {
                if (mouseButton === 1) {
                    Draw.mouseClicked(pixels[4], 'center', Draw.leftMouseColor);
                }
                if (mouseButton === 3) {
                    Draw.mouseClicked(pixels[4], 'center', Draw.rightMouseColor);
                }
            }
        }
        if (Draw.mouseSize === 1) {
            if (Draw.isMouseDown) {
                if (mouseButton === 1) {
                    if (pixels[6]) {
                        Draw.mouseClicked(pixels[3], 'left', Draw.leftMouseColor);
                    }
                    if(pixels[7]) {
                        Draw.mouseClicked(pixels[1], 'right', Draw.leftMouseColor);
                    }
                    Draw.mouseClicked(pixels[0], 'top', Draw.leftMouseColor);
                    Draw.mouseClicked(pixels[2], 'bottom', Draw.leftMouseColor);
                    Draw.mouseClicked(pixels[4], 'center', Draw.leftMouseColor);
                }
                if (mouseButton === 3) {
                    if (pixels[6]) {
                        Draw.mouseClicked(pixels[3], 'left', Draw.rightMouseColor);
                    }
                    if(pixels[7]) {
                        Draw.mouseClicked(pixels[1], 'right', Draw.rightMouseColor);
                    }
                    Draw.mouseClicked(pixels[0], 'top', Draw.rightMouseColor);
                    Draw.mouseClicked(pixels[2], 'bottom', Draw.rightMouseColor);
                    Draw.mouseClicked(pixels[4], 'center', Draw.rightMouseColor);
                }
            }
        }
    },

    mouseOut: function (pixels) {

        pixels[4].style.background = Draw.currentBackground;
        
        if (Draw.mouseSize === 1 ) {
            pixels[3].style.background = Draw.currentLeftBackground;
            pixels[1].style.background = Draw.currentRightBackground;
            if (pixels[0] !== null) {
                pixels[0].style.background = Draw.currentTopBackground;
            }
            if (pixels[2] !== null) {
                pixels[2].style.background = Draw.currentBottomBackground;
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
            rightPixel = document.getElementById('id' + (Number(divNumber) + 1)),
            bottomPixel = document.getElementById('id' + Math.round(((rowPosition + 1) * divsWide))),
            leftPixel = document.getElementById('id' + (Number(divNumber) - 1)),
            centerPixel = div,
            farthestLeft = Number(leftPixel.id.replace('id', '')) % divsWide !== 0,
            farthestRight = Number(rightPixel.id.replace('id', '')) % divsWide !== 1;

        return [topPixel, rightPixel, bottomPixel, leftPixel, centerPixel, divsWide, farthestLeft, farthestRight]
    },

    mouseDown: function (pixels, mouseButton) {
        // Draw.isMouseDown = true; do this instead of document event listener for button down
        if (Draw.mouseSize === 0) {
            switch (mouseButton) {
            case 1:
                Draw.mouseClicked(pixels[4], 'center', Draw.leftMouseColor);
                break;
            case 3:
                Draw.mouseClicked(pixels[4], 'center', Draw.rightMouseColor);
                break;
            }
        }
        if (Draw.mouseSize === 1) {
            switch (mouseButton) {
            case 1:
                if (pixels[6]) {
                    Draw.mouseClicked(pixels[3], 'left', Draw.leftMouseColor);
                }
                if (pixels[7]) {
                    Draw.mouseClicked(pixels[1], 'right', Draw.leftMouseColor);
                }
                Draw.mouseClicked(pixels[0], 'top', Draw.leftMouseColor);
                Draw.mouseClicked(pixels[2], 'bottom', Draw.leftMouseColor);
                Draw.mouseClicked(pixels[4], 'center', Draw.leftMouseColor);
                break;
            case 3:
                if (pixels[6]) {
                    Draw.mouseClicked(pixels[3], 'left', Draw.rightMouseColor);
                }
                if (pixels[7]) {
                    Draw.mouseClicked(pixels[1], 'right', Draw.rightMouseColor);
                }
                Draw.mouseClicked(pixels[0], 'top', Draw.rightMouseColor);
                Draw.mouseClicked(pixels[2], 'bottom', Draw.rightMouseColor);
                Draw.mouseClicked(pixels[4], 'center', Draw.rightMouseColor);
                break;
            }
        }         
    },

    mouseClicked: function (div, location, mouseColor) {
        if (div !== null) {
            switch(location) {
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
    }
};

window.addEventListener('load', function loaded() {
    Draw.loaded();
}, false);