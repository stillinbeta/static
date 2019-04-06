function clearActive() {
    actx.clearRect(0, 0, 500, 500);
}
function clearStack() {
    sctx.clearRect(0, 0, 500, 500);
}

function get_relative_pos(evt) {
    var target = evt.currentTarget
    var x = evt.pageX - target.offsetLeft - target.clientLeft;
    var y = evt.pageY - target.offsetTop - target.clientTop;

    return [x, y];
}

function redrawStack() {
    // Draw from the first element to the last.
    clearStack();
    for (var i = 0; i < drawn.length; i++) {
        drawn[i].draw(sctx);
    }
}

function tip(tip_val) {
    $('#tip').html(tip_val);
}

function editMode(shape) {
    tip('Click and drag handles to resize. Click and drag inside the shape to move');
    clearColourEvent();
    $('#fg-color').val(shape.fg.replace('#', ''));
    $('#fg-color').css('background-color', shape.fg);
    $('#fg-color').change(function(evt) {
        if (evt.target.value) {
            shape.fg = '#' + evt.target.value;
            clearActive();
            drawHandles(shape);
        }
    });
    $('#bg-color').val(shape.bg.replace('#', ''));
    $('#bg-color').css('background-color', shape.bg);
    $('#bg-color').change(function(evt) {
        if (evt.target.value) {
            shape.bg = '#' + evt.target.value;
            clearActive();
            drawHandles(shape);
        }
    });

    $('#stroke-width').val(shape.border);
    $('#stroke-width').change(function(evt) {
        if (evt.target.value) {
            shape.border = evt.target.value;
            clearActive();
            drawHandles(shape);
        }
    });

    activec.one('mousedown', function (evt) {
        var origin = get_relative_pos(evt);

        // 3 = width/height of the handles
        if (origin[0] >= shape.x1 - 3 && origin[0] <= shape.x1 + 3 &&
            origin[1] >= shape.y1 - 3 && origin[1] <= shape.y1 + 3) {
            activec.mousemove(function(evt) {
                activec.css('cursor', 'nw-resize');
                var pos = get_relative_pos(evt);
                shape.x1 = pos[0];
                shape.y1 = pos[1];
                clearActive();
                drawHandles(shape);
                return false;
            });
            activec.one('mouseup', function(evt2) {
                activec.css('cursor', 'default');
                activec.unbind('mousemove');
                editMode(shape);
                return false;
            });
        } else if (origin[0] >= shape.x2 -3 && origin[0] <= shape.x2 + 3 &&
            origin[1] >= shape.y2 -3 && origin[1] <= shape.y2 + 3) {
            activec.mousemove(function(evt) {
                activec.css('cursor', 'se-resize');
                var pos = get_relative_pos(evt);
                shape.x2 = pos[0];
                shape.y2 = pos[1];
                clearActive();
                drawHandles(shape);
                return false;
            });
            activec.one('mouseup', function(evt2) {
                activec.css('cursor', 'default');
                activec.unbind('mousemove');
                editMode(shape);
                return false;
            });
        } else if (shape.inside(origin[0], origin[1])) {
            var x1 = shape.x1;
            var x2 = shape.x2;
            var y1 = shape.y1;
            var y2 = shape.y2;

            activec.mousemove(function(evt) {
                activec.css('cursor', 'move');
                var pos = get_relative_pos(evt);
                var offsetx = pos[0] - origin[0];
                var offsety = pos[1] - origin[1];
                shape.x1 = x1 + offsetx;
                shape.x2 = x2 + offsetx;
                shape.y1 = y1 + offsety;
                shape.y2 = y2 + offsety;
                clearActive();
                drawHandles(shape);
                return false;
            });
            activec.one('mouseup', function(evt2) {
                activec.css('cursor', 'default');
                activec.unbind('mousemove');
                editMode(shape);
                return false;
            });
        }
        return false;
    });
}

function selectButton(id) {
    $('.selected').removeClass('selected');
    $('#' + id).addClass('selected');
}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function randomBox() {
    var x = Math.floor(Math.random() * 450);
    var y = Math.floor(Math.random() * 450);
    var h = Math.floor(x + Math.random() * (500 - x));
    var w = Math.floor(y + Math.random() * (500 - y));
    var fg = get_random_color();
    var bg = get_random_color();
    var shape = new [Line, Triangle, Rect][Math.floor(Math.random() * 3)](x, y, h, w, 2, fg, bg);
    drawn.push(shape);
    redrawStack();
}

function duplicate() {
    drawn.push(new active_shape.constructor(active_shape.x1,
                                            active_shape.y1,
                                            active_shape.x2,
                                            active_shape.y2,
                                            active_shape.border,
                                            active_shape.fg,
                                            active_shape.bg));
    tip('Your new shape is above your old one');
    redrawStack();
}

function clearAll() {
    tip('Create a new shape, use the menu on the left');
    drawn = [];
    active_shape = null;

    clearActive();
    clearStack();
    selectButton('select');
}

function clearColourEvent() {
    $('#fg-color').unbind();
    $('#bg-color').unbind();
    $('#stroke-width').unbind();
}

function dragShape(evt, shape) {
    // Save current shape
    if (active_shape) {
        drawn.push(active_shape);
        redrawStack();
        active_shape = null;
    }

    var line = '#' + $('#fg-color').val();
    var bg = '#' + $('#bg-color').val();
    var border = $('#stroke-width').val();

    var origin = get_relative_pos(evt);
    activec.mousemove(function(evt2) {
        var pos = get_relative_pos(evt2);
        clearActive();
        new shape(origin[0], origin[1], pos[0], pos[1], border, line, bg).draw(actx);
    });

    activec.one('mouseup', function(evt2) {
        var pos = get_relative_pos(evt2);
        clearActive();
        active_shape = new shape(origin[0],
                             origin[1],
                             pos[0],
                             pos[1], border, line, bg);
        activec.unbind('mousemove');
        redrawStack();
        selectMode();
        return false;
    });
}

function selectMode(dont_search) {
    //tip('Click to select a shape');
    selectButton('select');
    activec.one('click', function (evt) {
        if (!dont_search) {
            if (active_shape) {
                drawn.push(active_shape);
                redrawStack();
                clearActive();
            }
            active_shape = null;
            var pos = get_relative_pos(evt);
            for (var i = drawn.length - 1; i >= 0 ; i--) {
                if (drawn[i].inside(pos[0], pos[1])) {
                    active_shape = drawn.splice(i, 1);
                    active_shape = active_shape[0];
                    break;
                }
            }
        }

        if (active_shape) {
            editMode(active_shape);
            redrawStack();
            clearActive();
            drawHandles(active_shape);
        } else {
            clearColourEvent();
            tip('Click to select a shape');
        }

        selectMode();
        return false;
    });
}

function deleteShape() {
    active_shape = null;
    clearActive();
    tip('Create a new shape, use the menu on the left');
}

$(function () {
    /* Global variables */
    activec = $('#active');
    stackc = $('#stack');
    drawn = [];
    actx = activec[0].getContext('2d');
    sctx = stackc[0].getContext('2d');
    active_shape = null;

    $('#random').click(randomBox);
    $('#clear').click(clearAll);
    $('#select').click(selectMode);
    $('#delete').click(deleteShape);
    $('#duplicate').click(duplicate);

    $('#triangle').click(function() {
        tip('Click and drag to create a triangle');
        clearColourEvent();
        selectButton('triangle');
        activec.unbind();
        activec.one('mousedown', function(evt) {
            dragShape(evt, Triangle)
            return false;
        });

        return false;
    });
    $('#rectangle').click(function() {
        tip('Click and drag to create a rectangle');
        clearColourEvent();
        selectButton('rectangle');
        activec.unbind();
        activec.one('mousedown', function(evt) {
            dragShape(evt, Rect);
            return false;
        });
        return false;
    });
    $('#line').click(function() {
        tip('Click and drag to create a line');
        clearColourEvent();
        clearColourEvent();
        selectButton('line');
        activec.unbind();
        activec.one('mousedown', function(evt) {
            dragShape(evt, Line);
            return false;
        });
        return false;
    });

    selectMode();
});
