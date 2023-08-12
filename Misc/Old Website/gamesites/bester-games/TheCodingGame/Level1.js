//Available variables
var vars = {'SOMEVAR':15, 'ABB':10, 'APPELFLAP':250, 'BONBON':'They are delicious!'};
//Pc-structure
var pc = 
{
	'home': {}
};
//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = '15';
//Show directory or not?
var showDirBool = false;
//Level Objective
var objective = 'Find the value of SOMEVAR<br/><span class="subObj">(Check the instructions for info, always)</span>';
var storyOverlay = "Once upon a time, there was the earth. It was around 2052, and for the past few decades super-intelligent robots had been put to use everywhere around the globe. First they assisted the people, helped them, completed tasks for them. But soon enough, they realized they were better than those tiny, dumb humans. January the 1st, they rebelled against the human population and took over all electronic devices in the world. No man could live without the help of robots anymore - everyone in the world had become enslaved to the almighty robots!^^Well, almost everyone. The robots were not able to take over your dusty, old laptop. Together with a small group of experienced hackers, you joined a rebellion (and called yourself Project Takeover, or PT). Tonight you had planned a meeting to learn the basics of hacking, but it's too dangerous to just walk on the streets these days. Therefore, they installed me to guide you to the process! Missie Minion X is now your duty; there's no time to waste!";
var instrucText = 'Press <span class="highlight">Return</span> to execute your statement.<br/><br/>Use <span class="highlight">val X</span> to get the value of variable X.<br/>Put <span class="highlight">send</span> after your statement to send it as your solution to the level.<br/><br/>For this level, we\'ve already created the variable SOMEVAR.<br/>To solve level 1, simply send the value of SOMEVAR to the computer!';