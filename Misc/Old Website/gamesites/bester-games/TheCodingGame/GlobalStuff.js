//ALl the engine's variables
//Current code and return statement lines
var curLine = 1;
var returnLine = 1;

//Variables for holding and processing input
var tempInput = '';
var inpSplit = [];
var holdVal = null;

//Skip certain arguments if already used
var skipNumbers = [];
var j = 0; //current loop number

//Control chunks
var nextC = 0; //current chunk to display
var timeOutVar = 1//30; //time between chunks

//Check whether level has been started and/or completed
var levelStarted = false;
var levelCompleted = false;

//Timing in milliseconds for fake 'processing' systemlines
var finishTime = 1000;
var finishTimePlus = finishTime+4000;

//variable for holding current connection we're in.
var curCon = null;

//Simulate Alert POPUP for Passwords and MEssages
var alertSim = false;
var tempVal = null;

//Function for loading next level!
//If we failed, simply reload level.
function loadNextLevel(fail) {
	if(!fail) {
		localStorage.curLevel = String(letOurLevelBe);
	}
	location.reload(true);
}

//Automatically put cursor at end of current line
function resetCursor() {
	var data = $('#line'+curLine).val();
	$('#line'+curLine).focus().val('').val(data);
}

//For the return statements from your code
function returnStuff(theVal, extraInfo) {
	(extraInfo == undefined) ? extraInfo = "" : extraInfo = extraInfo;
	if(extraInfo != "textArea") {
		$("#INPUT").append('<input type="text" class="aReturn ' + extraInfo + '" id="returnLine' + returnLine + '" value=" => ' + theVal +  '" />');
		$("#returnLine"+returnLine).fadeTo(3000,0.5);
		if(extraInfo != "") {
			var data = $('#returnLine'+returnLine).val();
    		$('#returnLine'+returnLine).focus().val('').val(data);
		}
		returnLine++;
	} else {
		//A textarea is needed!
		$("#INPUT").append('<div class="textAreaStyle aReturn">' +  theVal + '</div>');
	}
 }



 //Check if value, variable or directory is defined
	function checkIfExists(theVal) {
		if(theVal == undefined) {
			holdVal = inpSplit[j+1] + ' is undefined :( ';
			return false;
		} else {
			return true;
		}
	}

	//Get the current directory's properties by inputting a string with '.'s
	function getPropByString(obj, propString) {
	    if (!propString)
	        return obj;

	    var prop, props = propString.split('.');

	    for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
	        prop = props[i];

	        var candidate = obj[prop];
	        if (candidate !== undefined) {
	            obj = candidate;
	        } else {
	            break;
	        }
	    }
	    return obj[props[i]];
	}

	//Check if any text is selected, to disable users tinkering with the system!
	function isTextSelected(input) {
	    if (typeof input.selectionStart == "number") {
	        return (input.selectionStart >= 0 && input.selectionStart <= 4) && input.selectionEnd == input.value.length;
	    } else if (typeof document.selection != "undefined") {
	        input.focus();
	        return document.selection.createRange().text == input.value;
	    }
	}

	function newComLine() {
		var prefix = '&nbsp;';
		if(curCon != null) {
			prefix = '#';
		}
		$("#INPUT").append('<input type="text" id="line' + (curLine+1) + '" class="aLine" value="' + prefix + '&nbsp;&gt;&nbsp;" />');
        $("#line"+curLine).fadeTo('slow',0.5);
     	curLine++;
     	//Put Cursor at Right Position
	    resetCursor();
	}
