//All GLobal Variables and functions have already been loaded..

//All command functions have already been loaded..

//Above (in the LevelX.js) all the level variables are loaded

//When page is loaded, do all this shit...
$(function() {
	$("#grandOverlay").toggle();
	//Function for dynamically typing the story on screen
	function chunkingStory() {
		if(nextC < chunks.length) {
			//If it's a period, wait a bit longer
			if(chunks[nextC] == ".") {
				setTimeout(chunkingStory,timeOutVar*30);
				$(".formatStory").append(chunks[nextC]);
			} else if(chunks[nextC] == "^" ) {
				//Create a newline if that dakje appears
				setTimeout(chunkingStory,timeOutVar*20);
				$(".formatStory").append('<br/>');
			} else {
				//Otherwise just show the next character
				setTimeout(chunkingStory,timeOutVar);
				$(".formatStory").append(chunks[nextC]);
			}
			nextC++;
		} else {
			//We're done! Let them start the level!
			$(".formatStory").append('<br/><p style="color:red;">Press SPACE to start.</p>');
		}
	}

	//Roll down the Story Overlay
	//Adapt height of story reader/scroller
	$(".formatStory").height(window.innerHeight-200);
	$("#INPUT").width(window.innerWidth);
	$( window ).resize(function() {
		$(".formatStory").height(window.innerHeight-200);
		$("#INPUT").width(window.innerWidth-50);
	});

	//Divide story into chunks (one letter each)
	var chunks = storyOverlay.match(/.{1,1}/g);
	//And start the timeout loop
	setTimeout(chunkingStory,timeOutVar);

	//System for pop-up instruction box!
	$("#bigI").html(instrucText);
	$("#bigI").toggle();
	$("#smallI").mouseenter(function () {
		$("#bigI").fadeToggle('fast');
		$("#smallI").fadeToggle('fast');
		$("#objective").css('text-align','left');
	});
	$("#bigI").mouseleave(function () {
		$("#bigI").fadeToggle('fast');
		$("#smallI").fadeToggle('fast');
		$("#objective").css('text-align','center');
	});
	//Show current directory (only if allowed by level)
	if(!showDirBool) {
		$('#curDir').toggle();	
	}
	$("#curDir").html(curDir);	

	//Set objective
	$("#objective").html('<span class="highlight" >Level ' + letOurLevelBe + ': </span>' + objective);

	//Randomize ID (prevent input-remembering, perhaps use it for something?)
	var randomNum = Math.round(Math.random() * 100000);
	$("#line1").addClass(String(randomNum));

	

	//Call resetcursor once at the start, then every keypress
	resetCursor();

	//Check if user presses something
    $( "body" ).keypress(function(e) {
    	//If the level hasn't started yet, prevent the user from doing anything else than reading the story
    	if(!levelStarted) {
    		e.preventDefault();
    		return;
    	}

    	//Check if anything has gone offscreen: remove it.
		$('#INPUT').children('input').each(function () {
			if($(this).offset().top < -50) {
			    $(this).remove();
			}
		});

    	//If it's return/enter..
      if(e.keyCode == 13) { 
      	//Process Input
      	tempInput = $("#line"+curLine).val();
      	tempInput = tempInput.substring(4, tempInput.length);
      	tempInput = $.trim(tempInput);
      	tempInput = tempInput.replace(/['"]+/g, '');

      	//Don't do anything if nothing has been typed
      	if(tempInput.length < 1) {
      		return;
      	}

      	//Go through command, splitting it by empty spaces
      	inpSplit = tempInput.split(" ");
      	for(var a=0;a<inpSplit.length;a++) {
      		//Keep track of which parts we still need to execute,and which we're currently using
      		j=a;
      		if(skipNumbers.indexOf(a) > -1) {
      			continue;
      		}
      		var i = inpSplit[a];

      		//ALl commands on a connection
      		if(curCon != null) {
      			if(i == networkLocationArr[curCon]) {
      				if(inpSplit[a+1] == String(correctAnswer)) {
      					levelCompleted = true;
      					sendCom();
      				}
      			}
      		} else {
      			//All different commands (on PC)
		      	if(i == 'val') {
		      		valCom();
		      	} else if(i == 'send') {
		      		sendCom();
		      	} else if(i == 'num') {
	 				intCom();
		      	} else if(i == 'string') {
		      		stringCom();
		      	} else if(i == 'to') {
		      		varCom();
		      	} else if(i == 'ls') {
		      		listCom();
		        } else if(i == 'cd') {
		        	cdCom();
		        } else if(i == 'read') {
		        	openCom();
		        } else if(i == 'edit') {
		        	editCom();
		        } else if(i == 'exec') {
		        	execCom();
		        } else if(i == 'network') {
		        	networkCom();
		        } else if(i == 'exit') {	 
		        	exitCom();
		    	} else {
		      		returnStuff(i + ' is no command, silly you!');
		      		break;
		      	}

      		}
      	}
      	//Reset some variables
      	holdVal = 0;
      	skipNumbers = [];

      	//Create new line to input next command! 
      	if(!levelCompleted) {
      		newComLine();
      	}	
    }

      //Put Cursor at Right Position
	  resetCursor();
	});

	//If a key is down (this is necessary for not-alphabetic keys)
	 $('body').keydown(function(e) {
	 	//If it's backspace
	      if (e.which == 8) {
	      		//Prevent backspacing if nothing has been typed
	      		var textField = '#line'+curLine;
	      		var data = $(textField).val();
	      		if(data.length < 5 || isTextSelected($(textField)[0])) {
		      		e.preventDefault();	      			
	      		}
	      }
	      //Pressed space, start the level!
	      if(!levelStarted && e.which == 32) {
	      	e.preventDefault();
	      	$(".storyOverlay").fadeOut('slow');
	      	levelStarted = true;
	      }     
	});
});