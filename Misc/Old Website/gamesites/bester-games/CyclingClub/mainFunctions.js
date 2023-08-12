var game = null;

var lastNames = ["Laurence Fussell","Titus Jenkinson","Elvis Siegrist","Elmer Mayberry","Chong Stainbrook","Armando Dangelo","Dave Dowdle","Lavern Womble","Courtney Daluz","Waldo Simoneaux","Micah Mayhugh","Anderson Marsden","Berry Dendy","Buck Carron","Tommie Apple","Herbert Grisham","Nicholas Drakes","Rene Rue","Johnson Funches","Frederick Trabue","Arturo Cebula","Emile Berrier","Alfredo Castiglia","Jewel Brant","Micheal Cilley","Elliot Bylsma","Isidro Mastro","Manual Fretwell","Connie Dohm","Nelson Arteaga","Willard Furr","Raymon Slovak","Allan Vazques","Marcel Eifert","Kurt Blewett","Clemente Looper","Danilo Mull","Mauricio Worthy","Pat Risley","Hilario Smartt","Jonah Minard","Jacques Morein","Dong Rouillard","Bernardo Sampson","Lance Mckernan","Brett Aucoin","Angel Diede","Brian Rosenblum","Paul Wolcott","Garret Bostrom","Reginald Fine","Porfirio Delamater","Deshawn Eckler","Rafael Arline","Jules Erb","Bart Putman","Issac Backer","Rogelio Basye","Gail Ector","Coy Croll","Cyrus Vasko","Alejandro Mizell","Richard Dyess","Mitch Starner","Jeffrey Jump","Albert Driggs","Kory Forster","Lamont Hardt","Paris Dusek","Heriberto Malkin","Chester Esch","Darwin Mcnicholas","Peter Lamphear","Emory Sowders","Foster Golston","Sylvester Atwater","Boyce Putney","Osvaldo Fennell","Bobbie Yoshida","Harland Heywood","Dick Giuffre","Michel Medders","Jerald Kraft","Mikel Bosworth","Margarito Bolger","Emery Schlichting","Carroll Furtado","Grant Hanford","Arnold Bohan","Trinidad Yearby","Winfred Bascom","Hyman Lainez","Ron Branner","Curtis Devivo","Jermaine Damron","Parker Thatcher","Julius Willsey","Mickey Lauder","Odell Hurst","Norberto Provost","Florentino Vause","Moses Spelman","Dexter Lehto","Mickey Veltri","Kendrick Peet","Murray Her","Rubin Faddis","Frederic Barnhardt","Darron Ohlinger","Hilton Erikson","Mohamed Hoefle","Cedric Lymon","Hiram Poli","Jame Snavely","Kory Kitson","Brant Ladson","Leonel Stingley","Craig Dorantes","Nicky Sheriff","Corey Burgener","Daryl Harbuck","Shayne Norden","Prince Merida","Jacinto Beals","Vince Bencomo","Angel Fresquez","Shad Stiger","Neville Brucker","Stacy Tranmer","Kelly Whipkey","Grant Luth","Malik Abshire","Trinidad Batiste","Dino Holifield","Loren Orban","Bruce Hostetler","Dudley Hause","Titus Crawley","Ronald Schwein","Ellsworth Adkins","Louie Stubblefield","Sang Stroud","Enrique Beard","Moshe Giorgio","Isaiah Mikelson","Jeff Goncalves","Morton Hermosillo","Jim File","Lyman Lipka","Randal Mcwhite","Bradley Hardt","Felipe Marchant","Garret Duchene","Kasey Andujar","Abram Fedrick","Paul Faith","Erin Honaker","Terrence Sund","Christoper Sudduth","Sam Guzzi","Eduardo Resch","Juan Donald","Horacio Boykin","Brent Alto","Dudley Marciniak","Dorsey Visitacion","Dwight Loucks","Everett Jimison","Rafael Rita","Jerome Natoli","Jonas Swatzell","Stanley Duppstadt","Frederick Bough","Joe Bibbs","Eric Yuen","Ramiro Gremillion","Trinidad Batman","Alvaro Rhoades","Lyle Demaio","Hosea Sylvain","Daren Lettieri","Pierre Barcia","King Sol","Moshe Stacker","Felton Bridwell","Jeramy Riera","Mason Spigner","Vincenzo Vollmer","Isiah Roddy","Logan Grizzell","Marc Hoyt","Rudolph Gorney","Wilbert Fricke","William Lago","Francisco Virgin","Colby Turman","Joesph Jakubowski","Tommie Rumore","Ambrose Raffaele","Junior Zimmermann"];

var cityNames = ["Bessous","Craponne","Jussarupt","Menty","Xaintes","Rauzet","Hure","Tillac","Kerhenry","Urbise","Lannourzel","Autignac","Gillonnay","Mendive","Fontainebrux","Lesparre","Cervenon","Villarcoin","Montbolo","Citernes","Vivario","Vinot","Prachazale","Espinasse","Kergonan","Brimeux","Chantemille","Patay","Gorses","Blou","Fougerolles","Kerzellec","Recouvrance","Sarreinsmeing","Bouteille","Roisey","Kermilon","Yversay","Taillant","Semallé","Camplong","Grenois","Roncq","Farbus","Thevray","Hohrodberg","Mobecq","Doulezon","Chapdes","Cuevas","Dragonal","Montjoys","Ribafrecha","Vegadecabo","Pugeda","Alcira","Alfatares","Chamoso","Ortuella","Duruquiz","Sinde","Urigoiti","Humoso","Carballoblanco","Luberio","Mont","Tuimil","Posadillas","Castellciutat","Zambrocinos","Castanedo","Camposanco","Arenillas","Vallecillo","Borruga","Intorcisa","Mirallo","Montiró","Morales","Espasantes","Loscos","Pozanco","Juvencos","Grijó","Corbacera","Villaestrigo","Veigue","Vilde","Zuaztoy","Murla","Primout","Casela","Caunedo","Guadix","Agones","Brocos","Alfahuir","Cabezarados","Escanilla","Brackley","Harrow","Wilton","Weobley","Salisbury","Kenilworth","Neville","Landercost","Welshpool","Saffron","Reculver","Camelford","York","Brinkburn","Grinstead","Adwick","Ipswich","Caister","Edington","Burton","Epping","Margam","Cheltenham","Stamford","Westbury","Ruthin","Towcester","Haydon","Beaulieu","Chirk","Berkeley","Saurm","Ashburton","Bloxham","Clifford","Midurst","Malton","Seyning","Osyth","Rotherham","Wokingham","Stratford","Compton","Sandwich","Ampthill","Tavistock","Stanton","Jervaulx","Windsor","Carisbrooke","Bottelare","Birel","Moerkerkebrug","Hasselstraat","Buitenland","Goeslaer","Kiesegem","Frasnes","Kalenberg","Brandheide","Anzegem","Aaigem","Overnelle","Steertheuvel","Berneau","Neerdorp","Duikeldam","Grotenberg","Ghissegnies","Briegden","Forge","Favauge","Lorcé","Pontslag","Chevauchoir","Breedveld","Ekelbeek","Laerne","Korteboeken","Amermont","Sadzot","Millimont","Soiron","Wolverthem","Saventhem","Elsendamme","Baandries","Sneppelaer","Eindhoutham","Heers","Postel","Canger","Serskamp","Martenslinde","Spinele","Hagelstein","Ledeghem","Mariekerke","Hemelryk","Geeneinde","Kella","Spernsdorf","Brahlstorf","Ihlewitz","Ruderfing","Bettrum","Ottersdorf","Mittelbrink","Hoiersdorf","Marmagen","Gindelbach","Leopoldsthal","Breslack","Emmelsum","Rapperath","Waldvelen","Prebelow","Unterwasungen","Patzetz","Petersfeld","Erzweiler","Pferdekamp","Potzehne","Betzdorf","Ellerort","Zienau","Ehnes","Schienenhof","Freihausen","Krakau","Spreewiese","Steckelsdorf","Book","Aschhornermoor","Weddeln","Dechbetten","Obertresenfeld","Ehrang","Heimer","Neuwesteel","Marjoß","Bahlburg","Poppenhausen","Breitenrain","Steinwinkel","Kreypau","Weilheim","Kranichshof","Kurscheid","Scharrelerdamm","Ploaghe","Roccalumera","Pilastri","Rovale","Cutigliano","Cogorno","Filicello","Collodi","Leffe","Gordale","Forenza","Pizzago","Alvi","Umbri","Maratea","Caspoggio","Cerretella","Strangolagalli","Pugliola","Fano","Balvano","Acquarica","Aielli","Flumignano","Capurso","Latium","Conscio","Cesarolo","Novoli","Macereto","Cadine","Rimale","Fiumalbo","Zolforata","Mongrando","Valvori","Taibon","Orotelli","Villanova","Levanzo","Focà","Solano","Avelengo","Casargo","Gavigno","Candela","Stramare","Fontavignone","Elva","Piraino"];

var teamNames = ["Team","Sky","Race","Racing","Sun","Uniflex","Tinker","Belle","Giant","Europ","Car","Lotto","Star","Green","Edge","Pro","Cycling","Cannon","Dale","Trek","Derbo","Zipzap","Sollum","LaCarte","Banana","Albu","Parasol","Hexo","Sharp","Quick","Step","Lampa","Net","Boys","Magic","Pixi","Helio","H20","Jumbo","Alpaca","Hobo","Etiquette","Suda","Llama","Blokes","Wheel","Speed","Shooting","Ever","Super","Bizarre","Life","Intra","Dancing","Bike","Mighty","Dream","Strong","Haydom","Donlux","Geo","Tough","Voyage","Light","Hunters","Golden","Air","Cof"];

var sentences = ["Thinks about # very often","Misses #","Thinks # would beat $ in a fight","Started hating #","Obsessively believes in #","Thinks # cause(s) $","Doesn't remember #","Touches # when nobody's watching","Eats # for snacks","Tried to catch #","Tried to catch # with $","Baby-sits # for $","Argued with # about $","Pushed % with #","Kicked % because of #","Keeps telling % jokes about #","Feels % needs # more","Argued with % about #","Insists on firing %","Sings love songs to #","Can't understand #","Sold # to %","Threw # at % on %'s command"];
var words = ["his bed","elephants","squirrels","his room","pizza","climate change","dogs","sticks","wheels","jaguars","his hair","breakfast","socks","sandals","pandas","his wife","his bike","clouds","unicorns","Avatar","his smartphone","bugs","roads","his curtains","his watch","his saddle","hamburgers","love","midgets","flowers","tsunamis","tornados","Nemo","bad breath","rain","nachos","his handwriting","political issues","the economy","tigers","birds","birthdays","fireworks","warm hugs","conspiracy theories","spiders","mosquitos","contemporary art","his busy schedule","his ideas","police","taekwondo","books","slapstick","Picasso","his CD collection"];

var hobbies = ["swimmer","dancer","singer","soccer player","guitarist","pianist","bird watcher","comedian","talk show host","writer","trampoline jumper","barrelrider","curtain closer","TV watcher","joke killer","Santa Claus impersonator","serial killer","dog whisperer","baby sitter","all-you-can-eat food taster","magician","criminal","beautyblogger","actor","believer","window cleaner","assassin","drummer","mouse rescuer","chess player","party pooper","pokémon player","skydiver","bungeejumper","mountain climber","athlete","tennisser","cook"];
var weirdHobbies = ["write letters to the government","be interviewed","give a speech on national television","trick his friends into buying him three laptops","fly to another country and never come back","give presents","receive presents","give hugs to strangers","throw frisbees at strangers","break into the bank","kill spiders","jump over low, spiky fences","feel alone","be slapped in the face","walk","lose his phone","lose his wallet","fail to remember where he left the keys","adopt a rabbit","give free food to fish","swim","dance","write","protest against humanity","legalize gay marriage","pretend to stop smoking","shop until he drops","drink more than the bartender can handle","fight red pandas","invent new words","buy lots of candy","eat nothing for days","drink yoghurt","build his own table","destroy pencils"];
var relationShips = ["wife","kids","dog","cat","bike","car","friends","mates","girlfriend","nephew","cousin","chair","imaginary friend","clown","camera","eyes","hands","skippyball","guitar","hard drive","personal assistent","gadgets"];
var bigRounds = ["Tour de Dance","Giro de Patio","Vuelta l'Ecuador","Bibo de Baba","Ronde van Flammingen","Arca del Affewaschwater","Dolphiné"];

var foodNames = ["coconuts","cream","cocoa powder","chocolate","chips","crisps","fish","milk","corn","apricots","kidney beans","almonds","apples","olives","tomato puree","pizza","pancake","butter","red chile","cheese","wasabi","custard","cornetto","brandy","cherries","bagels","donuts","rice","lemons","amaretto","carrots","mushrooms","salsa","broccoli","dates","red cabbage","lettuce"];
var bandNames = ["Mind Your Own Business","Hell","Metal Man","Death to Deus","Anna Louisiana","Shaki Shaki","Simply Soothing","A Sport, A Dream","Riding the Wind","Keeping What I Stole","BodyBuilding Boys","SuperTrooper","Zappelin Singers","A Fear of Spiders","Of Pen and Price","Lord of the WingDings"];
var standardSentences = ["He is an enthousiastic # and $.","He pretends to be a #, but we've all seen him fail miserably.", "When he is at home, he secretly spies on other #s.", "He likes to #.","He doesn't like to #.","He likes to # with his $.","He has won # big rounds in his life, including for example the $.","He managed to win the # classic, $ times.", "While cycling, he always thinks about #.", "While talking, he always mentions #.","He often tells the same old story about that time with the #.","He always keeps # with him while he travels.","He enjoys distracting people by furiously painting #.","His favorite foods are # and $.","He is a big fan of the bands # and $."];

var diffTypes = ['flat','sprint','hill'];
var diffWeathers = ['Sunny','Rainy','Mixed','Cloudy','Rainstorm','Regular'];

var TEAM = [];
var TEAMNAMES = [];
var TOUR = [];
var SPECIALTIES = [];
var ALLPART = [];

var MONEY;
var NEWS = [];
var PAYHISTORY = [];
var FIRSTPLACES;
var RANKINGS;

//Which stage, and if it's before (0) or after (1)
var CURSTAGE = [0,0];
//Type of weather, temperature, wind force
var WEATHER = [];

var numTeams = 8;
var partLength = 10;

function newGame() {
	generateAllTeams();
	generateTour();
	generateNews();
	generateCyclists();
	game.state.start('MainHub');
}

function continueGame() {
	loadGame();
	game.state.start('MainHub');
}

function loadGame() {
	var data = localStorage.getItem("slot1");
	var toLoad = JSON.parse(data);
	TEAM = toLoad.team;
	TEAMNAMES = toLoad.teamnames;
	TOUR = toLoad.tour;
	SPECIALTIES = toLoad.specialties;
	ALLPART = toLoad.allpart;
	MONEY = toLoad.money;
	NEWS = toLoad.news;
	PAYHISTORY = toLoad.payhistory;
	CURSTAGE = toLoad.curstage;
	WEATHER = toLoad.weather;
	FIRSTPLACES = toLoad.firstplaces;
	RANKINGS = toLoad.rankings;
}

function generateNews() {
	MONEY = 10000;
	NEWS = [["Welcome to a new Tour!","Welcome, <b>" + TEAMNAMES[0][0] + "</b>, to this years Tour of Giants. You have been given a team of 6 of our best cyclists, waiting for you to coach them to success. Here's a few things you can do to get a good grip on this game:<br/><ul><li>Look at the classifications to see who you're up against</li><li>Look at all the stages and pick when you want to attack and how you're going to do it</li><li>Look at your finances to see how much you can spend and what your current cash flow is</li><li>Click on any of the team members to see all his statistics and perhaps give him some extra food or training!</li></ul><br/>But, be quick, the first stage is already tomorrow!<br/><br/>Best of Luck,<br/>The Director"]];
	//Which team member did it (index number), description of action (string sentence), how much money is costs/brought onto the table (dollar sign and number)
	PAYHISTORY = [];
	FIRSTPLACES = [0,0,0,0];
	//List of exact classification for each four groups, with a cyclist's myIndex number as items
	RANKINGS = [[],[],[],[]];
	WEATHER = [diffWeathers[Math.round(Math.random()*(diffWeathers.length-1))],Math.round(Math.random()*30)+5,Math.round(Math.random()*25)];
}

function generateAllTeams() {
	for(var i=0;i<8;i++) {
		var firstWord = teamNames[Math.round(Math.random()*(teamNames.length-1))];
		var fullName = firstWord;
		var abbrev = firstWord.charAt(0);
		if(Math.random() < 0.3) {
			fullName += "-";
		} else {
			fullName += " ";
		}
		do {
			var secondWord = teamNames[Math.round(Math.random()*(teamNames.length-1))];
		} while(secondWord == firstWord);
		//var secondWord = teamNames[Math.round(Math.random()*(teamNames.length-1))];
		fullName += secondWord;
		abbrev += secondWord.charAt(0);
		if(Math.random() < 0.3) {
			do {
				var thirdWord = teamNames[Math.round(Math.random()*(teamNames.length-1))];
			} while(thirdWord == secondWord);
			fullName += thirdWord;
			abbrev += thirdWord.charAt(0);
		} else {
			var thirdWord = secondWord.charAt(Math.round(Math.random()*(secondWord.length-1)));
			abbrev += thirdWord.toUpperCase();
		}
		TEAMNAMES.push([fullName,abbrev,0]);
	}
}

function ra(){
	return Math.round(Math.random()*200);
}

function generateCyclists() {
	var teamCounter = 0;
	for(var i=0;i<numTeams*6;i++) {
		var firstTemp = lastNames[Math.round(Math.random()*(lastNames.length-1))];
		var first = firstTemp.split(" ")[0];
		var lastTemp = lastNames[Math.round(Math.random()*(lastNames.length-1))];
		var last = lastTemp.split(" ")[1];
		var name = first + " " + last;
		var randAge = Math.round(Math.random()*25)+18;
		//Set rankings to standard values
		for(var j=0;j<4;j++) {
			RANKINGS[j].push(i);
		}
		//Biography generation
		var generatedBio = 'He is ' + randAge + ' years old.';
		var r = -1;
		var previousS = [];
		for(var j=0;j<6;j++) {
			do {
				r = Math.round(Math.random()*(standardSentences.length-1));
			} while (previousS.indexOf(r) > -1)
			var newS = standardSentences[r];
			previousS.push(r);
			if(r < 3) {
				var r2 = Math.round(Math.random()*(hobbies.length-1));
				var r3 = Math.round(Math.random()*(hobbies.length-1));
				newS = newS.replace('#',hobbies[r2]);
				newS = newS.replace('$',hobbies[r3]);
			} else if(r < 6) {
				var r2 = Math.round(Math.random()*(weirdHobbies.length-1));
				var r3 = Math.round(Math.random()*(relationShips.length-1));
				newS = newS.replace('#',weirdHobbies[r2]);
				newS = newS.replace('$',relationShips[r3]);
			} else if(r == 6) {
				var r2 = Math.round(Math.random()*(bigRounds.length-1));
				newS = newS.replace('#',Math.round(Math.random()*12)+2);
				newS = newS.replace('$',bigRounds[r2]);
			} else if(r == 7) {
				var r2 = Math.round(Math.random()*(cityNames.length-1));
				var r3 = Math.round(Math.random()*(cityNames.length-1));
				newS = newS.replace('#',cityNames[r2] + ' - ' + cityNames[r3]);
				newS = newS.replace('$',Math.round(Math.random()*17)+2);
			} else if(r < 13) {
				var r2 = Math.round(Math.random()*(words.length-1));
				newS = newS.replace('#',words[r2]);
			} else if(r == 13) {
				var r2 = Math.round(Math.random()*(foodNames.length-1));
				var r3 = Math.round(Math.random()*(foodNames.length-1));
				newS = newS.replace('#',foodNames[r2]);
				newS = newS.replace('$',foodNames[r3]);
			} else if(r == 14) {
				var r2 = Math.round(Math.random()*(bandNames.length-1));
				var r3 = Math.round(Math.random()*(bandNames.length-1));
				newS = newS.replace('#',bandNames[r2]);
				newS = newS.replace('$',bandNames[r3]);
			}
			generatedBio += " " + newS;
		}
		var imageArr = [Math.round(Math.random()*4),Math.round(Math.random()*4),Math.round(Math.random()*4),Math.round(Math.random()*4)];
		var shortName = name.split(" ")[0][0] + ". " + name.split(" ")[1];
		//Determine skills
		var skills = [0,0,0,0,0,0,0,0,0];
		var totalSkill = 0;
		while(totalSkill < 900) {
			var randExtra = Math.round(Math.random()*9)+1;
			skills[Math.round(Math.random()*8.98-0.49)] += randExtra;
			totalSkill += randExtra;
		}
		var combinedObject = {name: name, shortName: shortName, team: TEAMNAMES[teamCounter], age:randAge, bio:generatedBio, image:imageArr, myIndex:i, fitness:100, morale:100, yPoints:0, gPoints:0, rPoints:0, wPoints:0, sprint:skills[0], speed:skills[1], stamina:skills[2], climb:skills[3], timeTrial:skills[4], descend:skills[5], adventure:skills[6], resistance:skills[7], recovery:skills[8], yRank:(i+1), gRank:(i+1), rRank:(i+1), wRank:(i+1)};
		if(i<6) {
			combinedObject['diet'] = '';
			combinedObject['training'] = '';
			combinedObject['equipment'] = '';
			combinedObject['salary'] = 1000;
		}
		ALLPART.push(combinedObject);
		if(i<6) {
			TEAM.push(combinedObject);
		}
		if(i%6 == 0 && i != 0) {
			teamCounter++;
		}
	}
}

function playerInfoSmall(OBJ) {
	return '<table width="100%" height="100%"><tr><td>Sprint</td><td colspan="2">' + OBJ.sprint + '</td></tr><tr class="alternateBG"><td>Speed</td><td colspan="2">' + OBJ.speed + '</td></tr><tr><td>Stamina</td><td colspan="2">' + OBJ.stamina + '</td></tr><tr class="alternateBG"><td>Climb</td><td colspan="2">' + OBJ.climb + '</td></tr><tr><td>Time trial</td><td colspan="2">' + OBJ.timeTrial + '</td></tr><tr class="alternateBG"><td>Descend</td><td colspan="2">' + OBJ.descend + '</td></tr><tr><td>Adventurous</td><td colspan="2">' + OBJ.adventure + '</td></tr><tr class="alternateBG"><td>Resistance</td><td colspan="2">' + OBJ.resistance + '</td></tr><tr><td>Recovery</td><td colspan="2">' + OBJ.recovery + '</td></tr><tr class="inBetweenFinance" style="height:30px;"><td></td><td colspan="2"></td></tr><tr><td>Time</td><td>' + OBJ.yPoints + '</td><td>(#' + OBJ.yRank + ')</td></tr><tr><td>Sprint points</td><td>' + OBJ.gPoints + '</td><td>(#' + OBJ.gRank + ')</td></tr><tr><td>Mountain points</td><td>' + OBJ.rPoints + '</td><td>(#' + OBJ.rRank + ')</td></tr><tr><td>Young rider points</td><td>' + OBJ.wPoints + '</td><td>(#' + OBJ.wRank + ')</td></tr></table>';
}

function reFormat(a) {
	a = Math.floor(a);
	var temp = Math.floor(a/3600);
	if(temp < 10) {
		temp = "0"+temp;
	}
	var temp2 = Math.floor(a/60)%60;
	if(temp2 < 10) {
		temp2 = "0"+temp2;
	}
	var temp3 = Math.round(a%60);
	if(temp3 < 10) {
		temp3 = "0"+temp3;
	}
	return temp + ":" + temp2 + ":" + temp3;
}

function generateTour() {
	var startPoint = cityNames[Math.round(Math.random()*(cityNames.length-1))];
	SPECIALTIES[0] = 'Time Trial';
	SPECIALTIES[Math.round(Math.random()*10)+10] = 'Time Trial';
	SPECIALTIES[7] = 'Rest Day';
	SPECIALTIES[15] = 'Rest Day';
	for(var i=0;i<23;i++) {
		TOUR[i] = [];
		var length;
		if(SPECIALTIES[i] == 'Time Trial') {
			length = Math.round(Math.random()*4)+2;
		} else if(SPECIALTIES[i] == 'Rest Day') {
			TOUR[i] = [[0,50,startPoint,"flat"],[1,50,startPoint,"flat"]];
			continue;
		} else {
			length = Math.round(Math.random()*150)+100;
		}
		if(SPECIALTIES[i] == null) {
			SPECIALTIES[i] = ' - ';
		}
		var height = Math.random()*50+25;
		var lastSpecialSpot = 0;

		// Push the special points
		// (x,y), startCity, type
		var lastHeight = height;
		var specialStages = [];
		for(var a=0;a<length;a++) {
			var randCity = cityNames[Math.round(Math.random()*(cityNames.length-1))];
			TOUR[i][a] = [];
			if(a==0) {
				TOUR[i][0] = [a,height,startPoint,'flat'];
				specialStages.push(a);
			} else if(a==length-1) {
				if(SPECIALTIES[i] == 'Time Trial') {
					randCity = startPoint;
				}
				var type = diffTypes[Math.round(Math.random()*(diffTypes.length-1))];
				if(type == 'hill' && height < 60) {
					height += Math.random()*20+10;
				}
				TOUR[i][length-1] = [a,height,randCity,type];
				startPoint = randCity;
				specialStages.push(a);
			} else if((a-lastSpecialSpot) > 30 && (length-a) > 30 && Math.random() < 0.05) {
				var type = diffTypes[Math.round(Math.random()*(diffTypes.length-1))];
				if(type == 'sprint') {
					height = Math.random()*60;
				} else if(type == 'hill') {
					height = lastHeight+Math.random()*60;
				} else {
					height = Math.random()*30+25;
				}
				if(height < 10) {
					height = 10;
				} else if(height > 90) {
					height = 90;
				}
				TOUR[i][a] = [a,height,randCity,type];
				lastHeight = height;
				lastSpecialSpot = a;
				specialStages.push(a);
			}
		}

		//Fill in what's in between
		var tempCounter = 0;
		for(var a=0;a<length;a++) {
			if(TOUR[i][a].length == 0) {
				var newHeight = 0;
				var nextEvent = specialStages[tempCounter];
				if(TOUR[i][nextEvent][3] == 'hill') {
					if(TOUR[i][a-1][1] + 5 < TOUR[i][nextEvent][1]) {
						newHeight = TOUR[i][a-1][1] + Math.random()*5 - 2;
					} else {
						newHeight = TOUR[i][a-1][1] - Math.random()*1;
					}
				} else {
					if(TOUR[i][nextEvent][1] > TOUR[i][a-1][1] + 10) {
						newHeight = TOUR[i][a-1][1] + Math.random()*4 - 1;
					} else if(TOUR[i][nextEvent][1] < TOUR[i][a-1][1] - 10) {
						newHeight = TOUR[i][a-1][1] + Math.random()*1 - 4;
					} else {
						newHeight = TOUR[i][a-1][1] + Math.random()*2-1;
					}
				}
				if(newHeight < 10) {
					newHeight = 10;
				} else if(newHeight > 90) {
					newHeight = 90;
				}
				TOUR[i][a] = [a,newHeight,'',''];
			} else {
				tempCounter++;
			}
		}
	}
}