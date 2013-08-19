/*!
 * Solari Board jQuery App
 * http://github.com/FogCreek/solari-board
 *
 * Uses jquery.transit.js:
 * http://ricostacruz.com/jquery.transit/
 *
 * date.js:
 * http://www.datejs.com/ 
 *
 *
 * Copyright © 2013 Fog Creek Software, Inc. All rights reserved.
 *
 * Released under the MIT license
 *
 * INSTRUCTIONS:
 * The solari board app takes an arbitrary json payload from a post command to target url
 * Currently, the solari board assumes a json structure in the following format:
 *    [
 *        {'sDate':'today','sTime':'13:30','sDeparture':'foo@example.com','nStatus':1,'nTrack':17, 'fLight':true},
 *        {'sDate':'yesterday','sTime':'16:00','sDeparture':'bar@example.com','nStatus':2,'nTrack':19, 'fLight':false},
 *        {'sDate':'July 8th, 2013','sTime':'16:30','sDeparture':'baz@example.com','nStatus':2,'nTrack':23, 'fLight':false}
 *    ]
 *
 *  The nStatus field is only used if status_override = false.
 */

// some constants and enums
var RATE_VARIANCE = 8; // for determining random animation rate in milliseconds
var RATE_BASE = 8; // for determining random animation rate in milliseconds  
var BOARD_ROWS = 8; // total number of rows displayed on the solari board
var SECOND_SECTION_START = 8; // the first row that contains a next due case
var LETTER_HEIGHT = 26; // height of a single letter frame (in pixels) in the letter image
var FIRST_CHAR_CODE = 32; // the first ASCII character that is represented in the letter image
var LAST_CHAR_CODE = 96; // the last ASCII character that is represented in the letter image
var CHAR_FACTOR = 2; // every N character in the letter image is a "real" character
var IMAGE_HEIGHT = 20; // height of a single product or status image frame (in pixels)
var IMAGE_FACTOR = 2; // every N picture in the letter image is a "real" image (i.e., not an in-between frame)
var DEPARTURE_BOXES = 25; // number of letter boxes displayed in the departure column
var TIME_BOXES = 4; // number of letter boxes displayed in the time column
var TRACK_BOXES = 2; // number of letter boxes displayed in the track column
var REFRESH_TIME = 60; //refresh time in seconds
var EMPTY_ROW = {
    "sTime": "",
    "sDeparture": "",
    "nStatus": 0,
    "sStatus": "",
    "nTrack" : 0
};

//if true, the status column will be handled automatically according to time and date. false will override status with nStatus from payload
var status_override = true;
var URL = "../example/postJsonp.py"

var Status = {
    "none": 0,
    "all_aboard": 1,
    "on_time": 2,
    "delayed": 3,
    "departed": 4
};

var LAST_STATUS = 4;
var NextDueStatus = [null, "soon", "null", "overdue", null];
var solariTimeout;
var solari_setup_done = 0;
var failboard = false;
var syncing = true;

// start with variable that will hold data, empty, current and new boards
var solariData;
var current_board = [];
var new_board = [];

//an attempt to reduce slowdown from animations
jQuery.fx.interval = 20;

function ToUpper(code) {
    if (code > 96 && code < 123) {
        code -= 32;
    }
    return code;
}

//constructs the solariBoard within the given div. If no parameter is given, adds the board to "body"
function addSolariBoard(divSelector) {
    if (solari_setup_done === 1) {
        return;
    }
   
    if (arguments.length === 0) {
        $("body").append("<div id=\"solariBoardDiv\" style=\"width:970px;margin:0 auto;overflow:hidden\"></div>");
        divSelector = "#solariBoardDiv";
    }
       
    //The html structure of the solari board. This implementation is pretty ugly, but is a simple, single-append solution. 
    var $solari = $("<div class=\"column solari_grid\">" +
            "<a id='show-solari' href=\"index.html\" onclick=\"localStorage['StopSolari']=0\">Show Solari Board</a>" +
            "<div id=\"solari\" class=\"panel\">" +
            "<div id=\"departures\">" +
            "<header class=\"solari-board-header rounded\"> " +
            "<div class=\"solari-board-icon\"> </div>" +
            "<div class=\"clockContainer\">" +
            "<ul class=\"clockList\">" +
            "<li id=\"hours\">12</li>" +
            "<li id=\"point\">:</li>" +
            "<li id=\"min\">00</li>" +
            "<li id=\"ampm\"> pm</li>" +
            "</ul>" +
            "</div>" +
            "<div id=\"next-due\">" +
            "<p>Next due:</p>" +
            "<div class=\"inner low\">" +
            "<span class=\"clock\">00:00</span>" +
            "<span class=\"today\"></span>" +
            "</div>" +
            "</div>" +
            "</header>" +
            "<ul class=\"solari-board-columns rounded\">" +
            "<li class=\"time\">Time</li>" +
            "<li class=\"departure\">Departure</li>" +
            "<li class=\"status\">Status</li>" +
            "<li class=\"track\">Track</li>" +
            "</ul>" +
            "<ul class=\"solari-board-rows rounded\">" +
            "</ul>" +
            "</div>" +
            "<div id=\"last-updated\">Last updated: <span>n/a</span></div>" +
            "</div>" +
            "</div>" +
            "</div>").html();
    //add the board html
    $(divSelector).append($solari);

    //set up clock
    setInterval(function () {
        var date = new Date();
        // Convert to 12 hour format
        var hours = date.getHours();
        $("#hours").html(hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours));
        // Add a leading zero to the minutes value and am/pm
        var minutes = date.getMinutes();
        $("#min").html((minutes < 10 ? "0" : "") + minutes);

        // Set am/pm
        $("#ampm").html(hours < 12 ? " am" : " pm");
    }, 15000); // every 15 seconds is plenty accurate


    // show the solari board.
    if (!localStorage['StopSolari'] || localStorage['StopSolari'] === '0') {
        $('#solari').show();
        $('#show-solari').hide();
    } else {
        $('#solari').hide();
        $('#show-solari').show();
        return;
    }

    $('li.track').click(function () {
        updateSolariBoard();
    });

    // we want people who don't care about the solari board to be able to hide it.
    $('#next-due').click(function () {
        localStorage['StopSolari'] = '1';
        $('#solari').hide();
        $('#show-solari').show();
    });
    // and show it
    var $section;

    // build the solari board
    for (var add_rows = 0; add_rows < BOARD_ROWS; add_rows++) {
        // initialize the board with default "empty" board data objects
        current_board[add_rows] = EMPTY_ROW;

        if ($section === undefined) {
            $section = $('#departures .solari-board-rows');
        }
        // add a row
        $section.append('<li class=board-data id=row' + add_rows + '><ul><li class=time></li><li class=departure></li></li><li class=status><div class=iconbox><div class=status-icon></div></div></li><li class="track"></li><li class=alert><span class="circle"></span></li></ul></li>');

        // add the letter boxes in the time column
        for (var add_time_col = 0; add_time_col < TIME_BOXES; add_time_col++) {
            $('#row' + add_rows + ' li.time').append('<div id=time-row' + add_rows + 'box' + add_time_col + ' class=letterbox></div>');
            // insert a dot after the second box
            if (add_time_col === 1) {
                $('#row' + add_rows + ' li.time').append('<div class=dot>.</div>');
            }
        }

        // add the letter boxes in the middle column
        for (var add_cols = 0; add_cols < DEPARTURE_BOXES; add_cols++) {
            $('#row' + add_rows + ' li.departure').append('<div id=departure-row' + add_rows + 'box' + add_cols + ' class=letterbox></div>');
        }

        // add the letter boxes in the track column
        for (var add_track_col = 0; add_track_col < TRACK_BOXES; add_track_col++) {
            $('#row' + add_rows + ' li.track').append('<div id=track-row' + add_rows + 'box' + add_track_col + ' class=letterbox></div>');
        }
    }
    solari_setup_done = 1;
    window.setInterval(updateSolariBoard(), 1000 * REFRESH_TIME);
}

function NextDue(id, time, offset, status) {
    $(id + ' .today').html(offset);
    $(id + ' .clock').html(time);
    $(id + ' .inner').attr('class', 'inner'); // get rid of any existing classes
    $(id + ' .inner').addClass(new_board[0] === EMPTY_ROW ? "later" : NextDueStatus[status]); // add the appropriate class based on status. If no data, green.
}

function UpdateSolariRow(row, current_row, new_row) {
    var rate = RATE_BASE + Math.random() * RATE_VARIANCE + Math.random() * RATE_VARIANCE + Math.random() * RATE_VARIANCE;

    SpinChars(rate, '#time-row' + row, TIME_BOXES, current_row.sTime.replace(":",""), new_row.sTime.replace(":",""));
    SpinChars(rate, '#departure-row' + row, DEPARTURE_BOXES, current_row.sDeparture, new_row.sDeparture);

    //turn track numbers into strings for display. Ensure they are always two chars long
    current_row.sTrack = current_row === EMPTY_ROW ? "" : current_row.nTrack.toString().length > 1 ? current_row.nTrack.toString() : "0" + current_row.nTrack.toString();
    new_row.sTrack = new_row === EMPTY_ROW ? "" : new_row.nTrack.toString().length > 1 ? new_row.nTrack.toString() : "0" + new_row.nTrack.toString();
    SpinChars(rate, '#track-row' + row, TRACK_BOXES, current_row.sTrack, new_row.sTrack);  
    SpinImage(rate, '#row' + row + ' .status-icon', current_row.nStatus, new_row.nStatus);

    //clear and apply light class
    $("#row" + row + " span").attr('class', 'circle');
    $("#row" + row + " span").addClass(new_row.bLight ? 'circle-on' : 'circle');
}

function SpinChars(rate, selector_prefix, max_boxes, current_text, new_text) {
    //populate each box
    var num_spins = 0;
    for (var box = 0; box < max_boxes; box++) {
        // get the to and from character codes for this box
        var to_char_code = ToUpper(((new_text.length > box) ? new_text.charCodeAt(box) : 32));
        var from_char_code = ToUpper(((current_text.length > box) ? current_text.charCodeAt(box) : 32));
        var final_pos = '';
        if (from_char_code > to_char_code) {
            num_spins = ((LAST_CHAR_CODE - from_char_code) + (to_char_code - FIRST_CHAR_CODE)) * CHAR_FACTOR;
            final_pos = ((LETTER_HEIGHT * (to_char_code - FIRST_CHAR_CODE)) * CHAR_FACTOR) * -1;
        } else {
            num_spins = (to_char_code - from_char_code) * CHAR_FACTOR;
        }
        var selector = selector_prefix + 'box' + box; // add the box part

        SpinIt(selector, num_spins, rate, LETTER_HEIGHT, final_pos);
    }
}

function SpinImage(rate, selector, from_pos, to_pos) {
    var final_pos = '';
    var num_spins = 0;

    if (from_pos > to_pos) {
        num_spins = (((LAST_STATUS - from_pos) + to_pos) * IMAGE_FACTOR);
        final_pos = ((IMAGE_HEIGHT * to_pos) * IMAGE_FACTOR) * -1;
    } else {
        num_spins = ((to_pos - from_pos) * IMAGE_FACTOR);
    }

    if (from_pos === 4 && to_pos === 0) {
        num_spins = 8;
    }

    //unless we're not moving at all, make the image go 'round 8 more times that it needs to, otherwise it finishes too fast.
    if (num_spins !== 0) {
        $('audio#solari-audio')[0].play();
        num_spins +=80;
    }
    SpinIt(selector, num_spins, rate, IMAGE_HEIGHT, final_pos);
}

function SpinIt(selector, num_spins, rate, pixel_distance, final_pos) {
    for (var ii = 0; ii < num_spins; ii++) {
        $(selector).transition(
            {backgroundPositionY: '-=' + (pixel_distance * 2)},
            {duration: 1, easing: "linear"}
        );
        $(selector).transition(
            {backgroundPositionY: '+=1'},
            {duration: rate, easing: "linear"}
        );
        // on the very last iteration, use a call back to set the background position to the "real" position
        var f = function () {};
        if ((final_pos !== '') && (ii === (num_spins-1))) {
            f = function() {
                $(selector).css('backgroundPositionY', final_pos);
            };
        }
        $(selector).transition({backgroundPositionY: '+=' + (pixel_distance - 1)}, 1, f);
    }
}

function GetFailBoard() {

    $("#arrivals .solari-board-header, #arrivals .solari-board-columns").hide(1000);

    var fail_whale = [];
    fail_whale[0] = "    v  v        v";
    fail_whale[1] = "    !  !  v     !  v";
    fail_whale[2] = "    ! .-, !     !  !";
    fail_whale[3] = " .--./ /  !  _.---.!";
    fail_whale[4] = "  '-. (__..-\"       \\";
    fail_whale[5] = "     \\          &    !";
    fail_whale[6] = "      ',.__.   ,__.-'/";
    fail_whale[7] = "        '--/_.'----''";

    var board = [];
    // update each row on the board
    for (var row = 0; row < BOARD_ROWS; row++) {
        board[row] = {
            "sTime": "",
            "sDeparture": fail_whale[row],
            "nStatus": 0,
            "nTrack": 0
        };
    }
    return board;
}

function jsonpCallback(data) {
    if (data !== null) {
        solariData = data.slice(0);
        failboard = false;
        syncing = false;
    }
}

function updateSolariBoard() {
    if (!syncing) {
        syncing = true;
        $.ajax({
            url: URL + "?callback=?",
            cache: false,
            type: "POST",
            dataType: "jsonp",
            jsonpCallback: "jsonpCallback",
            timeout: 10*1000,
            error: function () {
                failboard = true;
            }
        });
    
        // update last refresh time text
        $('#last-updated span').fadeOut("slow", function() {
            var now = new Date();
            $('#last-updated span').html(now.toLocaleString());
        }).fadeIn("slow");
    }


    if (!failboard && typeof solariData === 'undefined') {
        window.setTimeout(updateSolariBoard, 1000);
        return;
    }

    try {
        if (solariData.length === 0) {
            clearBoard();
            return;
        }
    }
    catch(err) {}

    //Format the "Next Due" box
    $("#arrivals .solari-board-header, #arrivals .solari-board-columns").show(1000);
    if (!failboard) {
        new_board = solariData;
        var i;
        //the next due box should display the next available time, which may not be from the first case
        var time;
        for (i=0; i< 8; i++) {
            time = solariData[i].sTime;
            if (typeof time !== "undefined")
                break;
        }
        var next_due_row = solariData[i];
        time = next_due_row.sTime;
        var timeDelta = Date.parse(next_due_row.sDate).getTime() - new Date().getTime();
        var nOffset = Math.ceil(timeDelta / (1000 * 60 * 60 * 24)); //divide by miliseconds per day
        var offset = (nOffset === 0 ? "" : nOffset.toString() + "d"); //hide if next due is today
        if(status_override) {
            if (time) {
                var hrsDelta = Number(time.substring(0,2)) - new Date().getHours();
                nOffset += timeDelta < 0 ? -1 : 0; // if the time difference is negative, which means we are within 24 hours of due, so reduce day offset by 1
                if (nOffset < 0) {
                    new_board[0].nStatus = 3; // if we've past the due date
                } else if (nOffset === 0 && hrsDelta < 2 && hrsDelta >= 0 ) {
                    new_board[0].nStatus =1; //due within 2 hours
                } else {
                    new_board[0].nStatus = failboard ? 1 : 2;
                }
            }
        }
        var status = next_due_row.nStatus;
        time = (time === "") ? "00:00" : time;
        NextDue("#next-due", time, offset, status);
    } else {
        //failed to get data
        new_board = GetFailBoard();
        $("ul.solari-board-columns li.departure").text("FAIL WHALE");
        NextDue("#next-due", '-FA1L-', '', 1);
    }

    // update each row on the board
    for (var row = 0; row < BOARD_ROWS; row++) {
        if ((new_board[row] === undefined)) {
            // make this an empty row
            new_board[row] = EMPTY_ROW;
        }
        // change the row
        UpdateSolariRow(row, current_board[row], new_board[row]);
    }

    // update the current_row board
    current_board = new_board.slice(0);
}

function clearBoard() {
    //stop all animations
    $(".time").children().stop(true, true);
    $(".departure").children().stop(true, true);
    $(".status").children().stop(true, true);
    $(".track").children().stop(true, true);
    for (var r = 0; r < 8; r++) {
        UpdateSolariRow(r, current_board[r], EMPTY_ROW);
        current_board[r] = EMPTY_ROW;
    }
}
