function ra() {
	return Math.round(Math.random()*52)+13;
}

//Available variables
var vars = {'ABBA':15};
//All passwords
var passwordArr = {'$DONTOPENTHIS.txt':'iliketosti'};
//Information for executing files
var installArr = {};
var nums = [ra(),ra(),ra()];
var curTime = 60;
//Directories to add (if required by level)
var addDir = {};
//All network locations available
var alla = '[R][ROBOT]Request ID: ' + nums[0] + ' + ' + nums[1] + " + " + nums[2];
var networkArr = {'192-02-450-0202':alla};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'John':{'$DONTOPENTHIS.txt':'My last name is Marachel. Deal with it.'},'Pyth':{'NetworkID.txt':'200'},'Lucy':{}},
		'system': {'os.dll':'01010010100000100101010101010101010<br/>10000101010100010011001<br/>100100000001001010','boot.run':'COMMANDS:{Suppress Network,Boot HackOS,Switch Power}<br/>SPACE ALLOCATION:{None}'}
	},
	'network': {
		'GLOBAL': {'Network-IP.txt':'The IP we will take over is 192-02-450-0202'},
		'LOCAL': {'! Local Network Is Classified !':''}
	}
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = nums[0]+nums[1]+nums[2];
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Solve it before time runs out!';
var storyOverlay = "After no more than a few minutes, you are all set to join the next mission. It's a small one, but nevertheless very important. 'Before sunrise the ninja of the team, Pyth, will sneak into the small underground network database a few blocks away. He must hack the system and get it under our control - but, the operation must be done without the robots noticing. We ran some tests, and we know that the robots check the system every minute. When they check it, we must fake its identity and send a valid signature back to them. This is complex stuff, but it helps us a lot if we succeed.'^^John stood from his chair, and walked towards the small window. It wasn't too long before sunrise, and everybody had already jumped from their places and started working. When John turned back around, he only saw you, still sitting at the table, confused about what to do.'You shall have to keep the robots busy during the operation. Within a minute you must send the correct information to the robots, to avoid raising suspicion.'";
var instrucText = 'Use <span class="highlight">network X Y</span> for any network actions (with X the action, and Y the goal).<br/><br>Use <span class="highlight">network listen X</span> to retrieve information from X<br/>X can be an IP address or literal link<br/><br/>Send the solution to the sum as answer.';
//Timer mechanism
$(function() {
	setTimeout(timertje, 1000);
	$('#curTime').html('00:'+curTime);
	function timertje() {
		if(curTime < 1) {
			alert('TIME\'S UP!');
			location.reload();
			console.log("TIME UP! FAIL!");
		}
		if(levelStarted && !levelCompleted) {
			curTime -= 1;
			var add = '';
			if(curTime < 10) {
				add = '0';
			}
			$('#curTime').html('00:'+add+String(curTime));
		}
		setTimeout(timertje, 1000);
	}
});