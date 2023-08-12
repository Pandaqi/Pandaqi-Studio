//Available variables
var vars = {'ABBA':15, 'NAME':'Batman','ID':292983,'TIME':3000};
//All passwords
var passwordArr = {};
var installArr = {'HackOS.install':'HackOS.install,Batman,292983,3000'};
var randomNetworkID = Math.round(Math.random() * 500);
var addDir = {'installDetails.log':'Success!<br/>NetworkID:' + randomNetworkID + '<br/>AuthenticationLevel: Medium'};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'userAccount.lib':'NAME:Batman<br/>ID:292983<br/>TIME:3000.'},
		'system': {'system.log':'At 26/01/2052, 12:02 the system was erased'}
	},
	'devices': {
		'AN': {'info.txt':'Anti-Network device, disables every type of signal.'},
		'PT-USB': {'HackOS.install':'NAME,ID,TIME'}
	}
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = addDir["installDetails.log"];
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Send the installation details!';
var storyOverlay = "Upon entering the meeting room, you see merely three devices on the table, surrounded by no more than five members of the PT. Unfortunately, he other ones had recently been caught in a mission. 'This is all we got, so we are more than happy to have you and your laptop here', said John M while quickly passing by. Nobody knew his last name, and he said that was for the better.  Everybody sat down around the table, and John started talking with a serious voice.^^'Please everybody, welcome our newest member! However, there is no time for celebrations and parties. We must quickly set up his laptop and connect it to our network. Execute the OS file, supply his credentials, and check the installation log to make sure everything has gone well. Now get to work, we only have an hour.'";
var instrucText = 'Use <span class="highlight">exec X</span> to execute file X<br/><br/>This is a dangerous operation, so the computer wants to verify a few things. This information is on your computer somewhere.<br/><br/>You need to provide the data as parameters behind the statement, like <span class="highlight">exec X PAR1 PAR2 PAR3</span><br/><br/>Once done, find the file with installation details, and send that.';