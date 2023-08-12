//Available variables
var vars = {'ABBA':15, 'ABB':10, 'APPELFLAP':250, 'BONBON':'They are delicious!'};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'player':{'someFile.txt':'','aDifferentFile.doc':''}}, 
		'hint.txt':'Go to the ~ directory. There you find another useful directory.'
	},
	'passwords': {'PASSWORD.txt':'1234xyz', 'NO-THIS-ONE.txt':'Just kidding'}
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = '1234xyz';
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Find the password!<br/><span class="subObj">(Check the instructions for info, always)</span>';
var storyOverlay = "You've come a long way, my friend! You now know everything about saving and getting all sorts of data. What's next, is to see everything that the computer is up to.^^There are multiple actions you can do to read a computer: list everything in a directory, go to another directory, and open files you find there. I warn you: You'll need all of those tactics here.^^Be quick now, your battery is draining!";
var instrucText = 'Use <span class="highlight">ls</span> to list every file or folder in your current directory<br/><br/>Use <span class="highlight">cd X</span> to change directory to X<br/>Use <span class="highlight">cd ..</span> to go back/up one directory<br/><br/>Use <span class="highlight">read X</span> to read file X in your current dir<br/><br/>The top (root) directory in a computer is always called <span class="highlight"> ~ </span><br/><br/>NOTE: You can always see your current directory in green, in the top center of the screen.';