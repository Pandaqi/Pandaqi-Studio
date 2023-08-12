//Available variables
var vars = {'ABBA':15, 'ABB':10, 'APPELFLAP':250, 'BONBON':'They are delicious!'};
//Pc-structure
var pc = 
{
	'home': {
	}
};
//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = 0;
//Show directory or not?
var showDirBool = false;
//Level Objective
var objective = 'Send the number 0 as answer!<br/><span class="subObj">(Check the instructions for info, always)</span>';
var storyOverlay = "Great Job! Now that you can get variable values and know how to send your answers, you need to learn to create your own variables. This is useful, if you want to save all sorts of data while you go on hacking.^^We distinguish two different types of variables: numbers and strings. Numbers are, as you might have guessed, all numbers you can think of. Strings are pieces of text.^^Now hurry up, we don't have all night!";
var instrucText = 'Use <span class="highlight">string X</span> to get the string value of X<br/>Use <span class="highlight">num X</span> to get the numeric value of X.<br/><br/>Put <span class="highlight">to X</span> after your statement to put the number/string before it into variable X<br/><br/>You can name a variable however you like (APPLE, BOOGY, etc.), and at any time you can get the value with the val command.<br/><br/>NOTE: <span class="highlight">num HELLO</span> results in 0 (HELLO is not a string), while <span class="highlight">string 178</span> results in an error.';