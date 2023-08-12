<!DOCTYPE html>
<html>
<head><title>Grmbl.</title>
<style type="text/css">
body {
	font-family:Rockwell;
	font-size:20px;
	background-color: rgba(255,255,229,1);
	color:#402401 !important;
	background-image: url('BackGroundHome-01.png');
}
.container {
	margin-left:auto;
	margin-right:auto;
	margin-top:30px;
	margin-bottom:30px;
	width:850px;
	box-sizing:border-box;
	height:100%;
	background-color:#FFD863;
	padding:10px;
	box-shadow: 0px 0px 4px #333601;
}
td {
	text-align:center;
	width:380px;
	height:200px;
	position:relative;
	transition: background-color 0.3s, opacity 0.3s, box-shadow 0.3s;
	opacity:0.75;
	padding:15px;
	vertical-align:top;
	background-color:#FFC752;

	background-size:100% 100%;
	background-repeat:no-repeat;
}
td:hover {
	background-color:#F2AA52;
	box-shadow:0px 0px 10px #333;
	opacity:1;
}
/*td p {
	display:none;
}*/
td span {
	background: rgba(255,255,255,0.6);
	padding:8px;
	margin:0px;
	font-size:18px;
	color:#333601;
}
a {
	text-decoration:none;
	color:inherit;
	width:100%;
	height:100%;
	display:block;
	padding-top:10px;
}
a:hover h2 {
	background: rgba(255,155,155,0.8);
	text-decoration: underline;
	color:rgb(155,20,20);
}
h2 {
	background: rgba(255,255,255,0.6);
	padding:8px;
	transition:background 0.3s, color 0.3s;
}
img {
	width:365px;
	height:207px;
}

h1 {
	color:#A52A2A;
	font-size:84px;
	text-shadow: 0px 2px 4px #333;
}
.arrow {
	width: 20px;
    height: 20px;
    border-bottom: 5px solid #A52A2A;
    border-right: 5px solid #A52A2A;
    transform: rotate(45deg);
    margin: auto;
    margin-top: -50px;
    box-shadow: 2px 2px 2px #333;
}

td p {
	position:absolute;
	top:40px;
	width:280px;
	background-color:rgba(255,155,60,0.6);
	padding:15px;
	display:none;
	text-align:left;
}
td:hover p {
	display:block;
}

tr td:first-child p {
	left:-350px;
}
tr td:first-child p:after {
    content: "";
	width:0;
	height:0;
	position:absolute;
	border: 10px solid transparent;
	border-left-color: rgba(255,155,60,0.6);
	left:100%;
	top:50%;
}
tr td:last-child p {
	right:-350px;
}
tr td:last-child p:after {
    content: "";
	width:0;
	height:0;
	position:absolute;
	border: 10px solid transparent;
	border-right-color: rgba(255,155,60,0.6);
	right:100%;
	top:50%;
}
</style>
</head>
<body>
<div style="margin:auto;text-align:center;"><h1>HTML5 GAMES</h1><div class="arrow"></div></div>
<div class="container">
	<table cellspacing="15">
	<tr>
		<td style="background-image:url(PPThumb.png);" ><a href="pigsandpizzas/"/><h2>PIGS & PIZZAS</h2></a><p>Kill all pigs with your poisonous pizzas before they kill you!</p></td>
		<td style="background-image:url(BBThumb.png);" ><a href="bomberman/"/><h2>BOMBERMAN</h2></a><p>Kill your enemies with enormous bombs before you step into the explosion yourself!</p></td>
	</tr>
	<tr>
		<td style="background-image:url(SPThumb.png);" ><a href="SoccerPhysics/"/><h2 style="margin-bottom:0px;">SOCCER PHYSICS</h2></a><p>Also known as "drunk soccer" and "what the hell are you doing, just hit that ball."</p></td>
		<td style="background-image:url(SSThumb.png);"><a href="sumoslam/" /><h2>SUPER SUMO SLAM</h2></a><p>Bump your enemies off that field, with your big belly!</p></td>
	</tr>
	<tr>
		<td style="background-image:url(IIThumb.png);"><a href="icegame/"><h2>iiICECREAM</h2></a><p>Get as far as you can in this snowy world before you are killed by the heat!</p></td>
		<td style="background-image:url(SimpleSudokuThumb.png);"><a href="SudokuTest.html"><h2>SIMPLE SUDOKU</h2></a><p>Simple random sudoku generator you can fill in and check when complete.</p></td>
	</tr>
	<tr>
		<td style="background-image:url(CCThumb.png);"><a href="CyclingClub/"><h2 style="margin-bottom:0px;">PRO CYCLING CLUB</h2><br/><span>(work in progress)</span></a><p>Try to manage your team to success in the Tour!</p></td>
		<td style="background-image:url(OCAT.png);"><a href="TruckRaceGame/"><h2 style="margin-bottom:0px;">OF COW AND THIEVES</h2><br/><span>(work in progress)</span></a><p>Try to free all the cows from the evil hands of treacherous thieves in this dynamic race game!</p></td>
	</tr>
	<tr>
		<td style="background-image:url(GCThumb.png);"><a href="guitarchords/"><h2>CRAZY CHORDS</h2></a><p>Not a game, just a website containing almost all chords for guitar/piano and articles on the music theory behind them!</p></td>
		<td style="background-image:url(SintGameThumb.png);"><a href="SintGame/"><h2>SINT GAME</h2></a><p>Zorg ervoor dat de Sint niet van het dak af valt, terwijl je cadeau's opvangt en in de juiste schoorsteen gooit!</p></td>
	</tr>
	<tr>
		<td style="background-image:url(EEThumb.png);" ><a href="EasterExpress/"/><h2 style="margin-bottom:0px;">EASTER EXPRESS</h2><br/><span>(under construction)</span></a><p>Survive for as long as you can while jumping from train to train, eating lots of eggs and carrots, and killing enemies!</p></td>
		<td><a href="TheCodingGame/"/><h2 style="margin-bottom:0px;">THE CODING GAME</h2><br/><span>(work in progress)</span></a><p>The world has been taken over by robots! Type the right codes at the right time to solve the coding puzzle levels. This game features my own made up computer language and plays completely inside a "terminal".</p></td>
	</tr>
	</table>
</div>

</body>
</html>