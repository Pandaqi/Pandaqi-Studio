ev.currentTarget.innerHTML = 'Next Round';
lastClickWasEvent = false;

// fill it with new options (randomly picked)
for(var i = 0; i < numOptionsPerRound; i++) {
	var container = document.createElement('div');

	// number
	var number = getRandom('numbers', numbers)

	var numberCont = document.createElement('div');
	numberCont.classList.add('numberText');
	numberCont.innerHTML = number;

	container.appendChild(numberCont);

	// effect container
	var effectCont = document.createElement('div');
	effectCont.classList.add('iconCont');

	container.appendChild(effectCont);

	// actual effects (can be multiple or none)
	const maxNumEffects = 2;
	var effectsAlreadyChosen = [];
	for(var e = 0; e < maxNumEffects; e++) {
		var skipEffect = (Math.random() <= (1.0/maxNumEffects)*e);

		if(skipEffect) {
			continue;
		}

		var randName = ''
		do {
			randName = getRandom('effects', effects)
		} while( effectsAlreadyChosen.includes(randName) );

		if(randName == 'None') {
			continue;
		}

		effectsAlreadyChosen.push(randName);

		var effect = effects[randName];

		var effectIcon = document.createElement('div');
		effectIcon.classList.add('effectIcon');
		effectIcon.innerHTML = randName;

		effectIcon.setAttribute('data-name', randName);

		effectIcon.addEventListener('click', function(ev) {
			var name = ev.currentTarget.getAttribute('data-name');
			var eff = effects[name]
			var prob = Math.ceil( (eff.prob / totalEffectProbability) * 100 ) * numOptionsPerRound * (0.5*maxNumEffects);

			var typeClass = "type" + eff.type.split(" ")[0];

			gameExplanationsDiv.innerHTML = "<strong>" + name + " <span class='effectTypeText " + typeClass + "'>(" + eff.type + ")</span>:</strong> " + eff.desc + " <span class='probabilityText'>(" + prob + "% probability of appearing)</span>";

			gameExplanationsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});

		effectCont.appendChild(effectIcon);
	}
	
	// finally, add the whole thing to the game container
	gameDiv.appendChild(container);