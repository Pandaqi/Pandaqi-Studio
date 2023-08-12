//Available variables
var vars = {'ABBA':15};
//All passwords
var passwordArr = {};
//Information for executing files
var installArr = {};
//Directories to add (if required by level)
var addDir = {};
//All network locations available
var networkArr = {'local-125':'Sytem returned: Double Door Systems, Locking Stuff Up Since 2040.','local-150':'ERROR. ERROR. Please update your Windows. It is completely unnecessary, but it will take a lot of your time.'};
var networkLocationArr = {'local-125':'EXPLODE'};
//Pc-structure
var pc = 
{
	'home': {
		'users': {'Lucy':{'PicturesOfCats.jpg':'Can\'t open this shit. I\'m just a terminal man.'}},
		'system': {'os.dll':'01010010100000100101010101010101010<br/>10000101010100010011001<br/>100100000001001010'}
	},
	'network': {
		'global': {' - Global Systems have been Shut Down -':''},
		'local': {'Windows':{'WindowCommands.txt':'(executed by simply saying WINDOWS COMMAND)<br/>OPEN, CLOSE, SEMI-OPEN, COVER, ROTATE, STRENGTHEN, EXPLODE amountofms  (experimental feature)','WindowID.txt':'150'},'Radio':{'Sorry, the radio system is due to arrive next saturday.':''},'Door':{'DoorCommands.txt':'OPEN, CLOSE, HIDE securitylevel, EXPLODE amountofms','DoorID.txt':'125'},'Water':{'Sewer-system is shut down temporarily because of fighting in Bassetwon.':''}}
	}
};

//Starting directory and path
var curDir = 'home';
var curPath = '';
//Correct Answer
var correctAnswer = 15000;
//Show directory or not?
var showDirBool = true;
//Level Objective
var objective = 'Explode them robots!';
var storyOverlay = "A gasp of relief went through the room when Pyth called, and brought the message that 'We did it!'. Now a small global network connection was in our possession, without the robots ever noticing a thing. Well, that was the plan. It was only minutes until we heard a loud knocking on the door. John whispered something in Lucy's ear, and she immediately pushed us back, into one of the (extremely) large cabinets in the side. Lucy didn't go in herself, but hid us with a stack of chairs. Then John opened the door.^^'Are you John? John M?' said a voice. 'Perhaps. Who are you?' 'I need to know I am safe here first.' John looked at Lucy for a few seconds, but eventually decided to let the man inside.^^'I am Carabas, the only survivor from the fighting in Bassetown.' 'Oh god!' Lucy yelled, louder than she wanted. 'I heard about it. Horrible, plain horrible. How did you escape?' 'I managed to disarm one of the older robots, and used his map data to find my way through the underground system. You don't know how glad I am that I found you guys!'^^Suddenly there was something knocking on the door again. But this time, it was much louder and agressive. These were the police robots, Carabas knew.^^'Lock the door, and explode it at the right moment. It's our only choice!'";
var instrucText = 'Acquire a network connection with the door\'s locking ystem.<br/><br/>Then set the right amount of time to wait before exploding.<br/><br/>Use <span class="highlight">local-</span> before a local Network ID to use it.<br/><br>Use <span class="highlight">network link X</span> to get inside a system (with ID/IP X) to give it commands.<br/>Use <span class="highlight">exit</span> to get out again.<br/><br/>Once you are inside a system, you only have to type a command (without network in front of it).<br/><br/>Set the door to explode in 15 seconds, that\'s how long we need to escape.';