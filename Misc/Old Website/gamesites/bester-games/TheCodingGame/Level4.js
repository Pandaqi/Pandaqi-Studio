//Available variables
var vars = {'ABBA':15, 'ABB':10, 'APPELFLAP':250, 'BONBON':'They are delicious!'};
//All passwords
var passwordArr = {'$hint.txt':'appelflap'};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'player':{'someFile.txt':'','aDifferentFile.doc':''}}, 
		'system': {'pass.dll':'0101000010010101'},
	}
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = '010100001001010100010010';
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Send the file with correct password!';
var storyOverlay = "You've finished your tutorials! Now we need to inform your friends. The system is set up to automatically email the completion results to them via a secure network. However, the only way a network can be secure, is if you manually add the password yourself.^^We need you to find a file with lots of binary numbers. This is almost the correct password, we're only missing the last number: 18. Add it to the file (in 0's and 1's of course), and send the file's contents to us!^^Do not waste time, it's almost midnight, and we all know what happens when it is....";
var instrucText = 'Use <span class="highlight">edit X Y</span> to make Y the content of file X<br/><br/>Use <span class="highlight">edit X !Y</span> to <i>add</i> Y to the content of file X<br/><br/>';