//Available variables
var vars = {'ABBA':15,};
//All passwords
var passwordArr = {'$boot.config':'applejuice'};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'player':{'someFile.txt':'','aDifferentFile.doc':''}}, 
		'system': {'osx32.dll':'01010000100101010001010101010110000010101001001010','$boot.config':'NAME:John M<br/>MISSION:Minion X<br/>LOCATION:Old Factory at Past Lane<br/>TIME:MIDNIGHT'},
	},
	'desktop': {},
	'network': {'Downloads':{'thePass.txt':'applejuice'}},
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = 'Old Factory at Past Lane';
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Find the location of the meeting!';
var storyOverlay = "Your friends at PT have received your data, and now trust and respect you as one of theirs. As their member, you should be present at the next meeting. They've send you the information, but they had to hide it for the robots.The information is stored inside a password protected file. You'll need to find the password, find the file, and get to know the location. If you've found it, send it to the pc for verification, and then jump on your bike to get there!";
var instrucText = 'A file of type <span class="highlight">$filename</span> is password protected<br/><br/>To read from it, or write to it, you\'ll need to enter the correct password.<br/><br/>You can use a <span class="highlight">&#92</span> to simulate spaces in a string';