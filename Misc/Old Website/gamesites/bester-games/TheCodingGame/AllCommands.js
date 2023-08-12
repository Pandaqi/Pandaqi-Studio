//Command for getting value of next argument
function valCom() {
	skipNumbers.push(j+1);
	inp = inpSplit[j+1];
	//It's a file!
	if(inp.split(".").length > 1) {
		console.log("FILE");
		var obj = getPropByString(pc, (curPath+curDir));
		var file = obj[inp];
		holdVal = file;
		console.log(holdVal);
	} else {
		//It's a variable
		holdVal = vars[inp];
	}
	checkIfExists(holdVal);
		returnStuff(holdVal);
} 

//Command for sending whatever value is before it
function sendCom() {
	if(holdVal == correctAnswer || levelCompleted) {
		//The player has solved it!
		returnStuff('Woohoo, that is correct! 50 points for gryffindor!','noTHING');
		levelCompleted = true;
		setTimeout(function() { returnStuff('Please wait while we continue the adventure','systemLine') },finishTime);
		//Go to the next level.
		setTimeout(loadNextLevel,finishTimePlus);
	} else {
		returnStuff('Sorry, that is not the right answer');
	}
}

//Do something with the next argument as an integer
function intCom() { 
	if(!isNaN(inpSplit[j+1])) {
		holdVal = inpSplit[j+1];
	} else {
		//make some calculation!
	}
	skipNumbers.push(j+1);
	returnStuff(holdVal);
}

//Do something with the next argument as a string
function stringCom() {
	skipNumbers.push(j+1);
	inp = inpSplit[j+1];
	inp = inp.replace(/\\/g, ' ');
	if(isNaN(inp)) {
		holdVal = String(inp);
	} else {
		holdVal = 'This ain\'t no string -.-';
	}
	returnStuff(holdVal);
}

//Set value before it to a variable name after it
function varCom() {
	skipNumbers.push(j+1);
	if(inpSplit[j+1] != undefined) {
		vars[String(inpSplit[j+1])] = holdVal;
		returnStuff(inpSplit[j+1] + " set to " + holdVal);
	} else {
		returnStuff("You must complete your commands, idiot!");
	}
}

//List all objects and strings in the current directory
function listCom() {
	var obj = getPropByString(pc, (curPath+curDir));
   var emp = false;
   for (var prop in obj) {
      	returnStuff(prop);
      	emp = true;
   }
   if(!emp) {
   		returnStuff('Sorry, this dir is empty');
   }
}

//Change directory
function cdCom() {
	skipNumbers.push(j+1);
	var inp = inpSplit[j+1];
	//Go to parent
	if(inp == '..') {
		if(curPath != '') {
			var tempPath = curPath.split(".");
			curDir = tempPath[tempPath.length-2];
			tempPath = tempPath.splice(0,tempPath.length-2);
			curPath = tempPath.join(".");
			if(curPath.length > 0) {
				curPath += ".";
			}
			returnStuff('Changed directory to \'' + curDir + '\'');
		} else if((curPath == '' && curDir != '')){
			curPath = "";
			curDir = "";
			returnStuff("Changed directory to ~ (root)");
		} else if((curDir == "" && curPath == '')) {
			returnStuff("Can't go further than that, solly!")
		}
	} else if(inp == '~') {
		//Go to root
		curPath = "";
		curDir = "";
		returnStuff("Changed directory to ~ (root)");
	} else {
		//Go to specific directory
		var emp = false;
		var obj = getPropByString(pc, (curPath+curDir));
		var isFile = inp.split(".");
	   for (var prop in obj) {
	      	if(inp == prop && isFile.length < 2) {
	      		if(curDir != "") {
	      			curPath += curDir+".";
	      		}
	      		curDir = prop;
	      		returnStuff("Changed directory to \'" + curDir + "\'");
	      		emp = true;
	      	}
	   }
	   if(!emp) {
	   		if(isFile.length < 2) {
		   		returnStuff("Directory not found.");	   			
	   		} else {
	   			returnStuff("That's a file, dumbass!");
	   		}
	   }
	}
	//Set to the new directory
	if(curDir == "") {
		$("#curDir").html("~");
	} else {
		var s = curPath.replace(/\./g, '/');
		$("#curDir").html(s+curDir);
	}
}

//Open/read files
function openCom() {
	skipNumbers.push(j+1);
	var inp = inpSplit[j+1];
	if(inp.charAt(0) == '$') {
		if(!checkPass(inp)) {
			returnStuff("Wrong password!");
			return;
		}
	}
	var emp = false;
	var obj = getPropByString(pc, (curPath+curDir));
   for (var prop in obj) {
      	if(inp == prop) {
      		returnStuff(' -/- Reading \'' + prop + '\' -/- ', 'systemLine');
      		if(obj[prop] == '') {
      			obj[prop] = 'Sorry, this file is empty.';
      		}
      		returnStuff(obj[prop], 'textArea');
      		emp = true;
      		holdVal = obj[prop];
      	}
   }
   if(!emp) {
   		returnStuff("File not found.");
   }
}

//Check password on files or folders
function checkPass(inp) {
	/*if(!alertSim) {
		$("#grandOverlay").toggle();
		var passProtect = prompt('Enter Password: ', '*******');
		$("#grandOverlay").toggle();
		tempVal = passwordArr[inp];
	} else {
		passProtect = $("#PASSINPUT").val();
		if(passProtect == tempVal) {
			passProtect = true;
		} else {
			passProtect = false;
		}
		return passProtect;
	}*/
	var passProtect = prompt('Enter Password: ', '*******');
	if(passProtect == passwordArr[inp]) {
		passProtect = true;
	} else {
		passProtect = false;
	}
	return passProtect;
}

//Edit a file
function editCom() {
	skipNumbers.push(j+1, j+2);
	var overwrite = true;
	var inp = inpSplit[j+1];
	//Check password
	if(inp.charAt(0) == '$') {
		if(!checkPass(inp)) {
			returnStuff("Wrong password!");
			return;
		}
	}
	var inp2 = inpSplit[j+2] ? inpSplit[j+2]  : 'Empty';
	//Check if we should add to file, or overwrite
	if(inp2.charAt(0) == "!") {
		inp2 = inp2.substr(1,inp2.length);
		overwrite = false;
	}
	//Add spaces at right places
	inp2 = inp2.replace(/\\/g, ' ');		
	var obj = getPropByString(pc, (curPath+curDir));
	var emp = false;
	for(var prop in obj) {
		if(prop == inp) {
			if(overwrite) {
				obj[prop] = String(inp2);
			} else {
				obj[prop] += String(inp2)
			}
			console.log(obj[prop]);
			returnStuff(inp + ' was succesfully edited');
			emp = true;
		}
	}
	if(!emp) {
		returnStuff("This file does not exist.");
	}
}

//Execute a file
function execCom() {
	skipNumbers.push(j+1,j+2,j+3,j+4);
	var inp = [inpSplit[j+1],inpSplit[j+2],inpSplit[j+3],inpSplit[j+4]];
	var emp = false;
	var obj = getPropByString(pc, (curPath+curDir));
	for(var a=1;a<inp.length;a++) {
		if(isNaN(inp[a])) {
			inp[a] = vars[inp[a]];
		}
	}
   for (var prop in obj) {
      	if(inp[0] == prop) {
      		returnStuff('Busy Executing...', 'systemLine');
      		if(inp[1] == undefined || inp[2] == undefined || inp[3] == undefined) {
      			returnStuff('ERROR: ' + prop + ' requires a ' + obj[prop] + '!');
      		}
      		var concat = inp.join(",");
      		var testAgainst = installArr[prop];
      		if(concat == testAgainst) {
      			pc["NETWORK"] = addDir;
      			setTimeout(function() { returnStuff('Succesfully installed PT OS!'); returnStuff('A new directory NETWORK has been created at root.'); },1000);
      		}
      		emp = true;
      		holdVal = obj[prop];
      	}
   }
   if(!emp) {
   		returnStuff("File not found.");
   }
}

//Network Actions
function networkCom() {
	skipNumbers.push(j+1,j+2);
	inp = inpSplit[j+1];
	inp2 = inpSplit[j+2];
	emp = false;
	if(inp == 'listen') {
		if(networkArr[inp2] != undefined) {
			returnStuff("Listening for IP....",'systemLine');
			setTimeout(function() { returnStuff('Retrieved Data: ' + networkArr[inp2], 'textArea'); newComLine();}, 3000);
			emp = true;
		}
	} else if(inp == 'link') {
		if(networkLocationArr[inp2] != undefined) {
			returnStuff("Connecting...",'systemLine');
			setTimeout(function() { returnStuff('Connected!', 'systemLine'); curCon = inp2; newComLine();}, 3000);
			emp = true;
		}
	} else {
		returnStuff("No Valid Action Specified!");
	}

	if(!emp) {
		returnStuff("Could Not Find Network Location.");
	}
}

function exitCom() {
	curCon = null;
	returnStuff('Killed connection.','systemLine')
}