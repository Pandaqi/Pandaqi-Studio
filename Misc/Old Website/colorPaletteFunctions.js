const colorThief = new ColorThief();
		    
var allGames = []
var numGames = 0

var defaultColorArray = [
	[[255,255,255], [0,0,0]],
	[[0,0,0], [255,255,255]],
	[[255,150,150], [50,0,0]],
	[[150,250,150], [0,50,0]],
	[[150,150,250], [0,0,50]]
	];

var colorPalettesCreated = 0;


function createColorPalette(ths, defaultColors = false) {
	var dom_col = [[0,0,0]]
	var defaultColInd = null;
	if(!defaultColors) {
		// get color palette associated with image
		dom_col = colorThief.getPalette(ths);

		// DISCARD any colors that are too neutral (too near grey; not enough contrast)
		for(var j = dom_col.length-1; j >= 0; j--) {
			var v = dom_col[j]
			var lum_value = (v[0] * 0.299 + v[1] * 0.587 + v[2] * 0.114)

    		if(lum_value > 120 && lum_value < 190) {
    			dom_col.splice(j, 1);
    		}
		} 
	} else {
		// pick a default color => remove it from array, and immediately get the removed element (splice does that)
		randomDefaultColInd = Math.floor(Math.random() * defaultColorArray.length);
		defaultColInd = defaultColorArray.splice(randomDefaultColInd, 1)[0];
	}

	var curGameIndex = ths.getAttribute('data-game-ind')
	var curGame = allGames[curGameIndex]

	var isStaticWide = (curGame.getAttribute('data-type') == 'static-wide');

	// change main color of container
	var newMainColor = randomColor(dom_col);
	if(defaultColors) {
		newMainColor = []

		var c = defaultColInd[0];
		newMainColor[0] = c
		newMainColor[1] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
	}
	curGame.style.setProperty('--mycolor', newMainColor[1])

	// set color in case this is a static wide image
	// this is based on the DOMINANT color
	var staticWideColor = null
	var swdColor = null // static wide dominant color
	if(isStaticWide) {
		swdColor = colorThief.getColor(ths);
		staticWideColor = invertColor(swdColor, 1.0, true)
		curGame.style.setProperty('--staticwidecolor', staticWideColor)

		var conv_swdColor = 'rgb(' + swdColor[0] + ',' + swdColor[1] + ',' + swdColor[2] + ')'
		curGame.style.setProperty('--staticwidedominantcolor', conv_swdColor)
	}


	// also update the container above us (to make the wavy lines work)
	if(curGameIndex > 0) {
		var prevGame = allGames[(curGameIndex-1)]

		prevGame.style.setProperty('--colorbelow', newMainColor[1])
		curGame.setAttribute('data-colorBelow', newMainColor[1])

		if(isStaticWide) {
			var conv_swdColor = 'rgb(' + swdColor[0] + ',' + swdColor[1] + ',' + swdColor[2] + ')'
			prevGame.style.setProperty('--colorbelow', conv_swdColor)
			curGame.setAttribute('data-swdColorBelow', conv_swdColor)
		}
	} 

	// the last game should also update itself to fit with the footer
	if(curGameIndex == (numGames - 1)) {
		curGame.style.setProperty('--colorbelow', '#333333')
	}

	// change link color text
	// (if the button exists)
	if(curGame.querySelector('.buttonLink') !== null) {
	curGame.querySelector(".buttonLink").style.color = invertColor(newMainColor[0], 1.0, true);
	}


	// change text color
	var newTextColor = randomColor(dom_col);
	if(defaultColors) {
		newTextColor = [];

		var c = defaultColInd[1];
		newTextColor[0] = c
		newTextColor[1] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
	}
	curGame.style.setProperty('--mytextcolor', newTextColor[1]);

	// change background color behind text
	//curGame.querySelector(".horizontalContentText").style.backgroundColor = invertColor(newTextColor[0], 0.5, true)


	// create a blur behind the text (to make it readable)
	curGame.querySelector(".horizontalContentText").style.setProperty('--blurcolor', invertColor(newTextColor[0], 0.75, true))

	colorPalettesCreated += 1;

	if(colorPalettesCreated == allGames.length) {
		autoplayOnMobile();
	}
}

function randomColor(arr) {
	var random_col = arr[ Math.floor(Math.random() * arr.length) ];
	return [random_col, 'rgb(' + random_col[0] + ',' + random_col[1] + ',' + random_col[2] + ')'];
}

function invertColor(col, alpha = 1.0, bw = false) {
	var r = col[0]
	var g = col[1]
	var b = col[2]

    if (bw) {
    	var lum_value = (r * 0.299 + g * 0.587 + b * 0.114)

        // http://stackoverflow.com/a/3943023/112731
        return lum_value > 149
            ? 'rgba(0,0,0,' + alpha + ')'
            : 'rgba(255,255,255,' + alpha + ')';
    }
    
    // invert color components
    /*
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);*/

    r = (255-r)
    g = (255-g)
    b = (255-b)
    
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';

    // pad each with zeros and return
    //return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
	len = len || 2;
	var zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

function playGif(el) {
	var gifAttr = el.getAttribute('data-gif')

	// if there is no attribute, return immediately
	if(gifAttr == 'null') {
		return
	}

	// if this is a static image
	// we must convert it to coverStyle
	// inform the game above us (in the list) that our color changed
	// and remove static class
	if(el.getAttribute('data-type') == 'static-wide') {
		var temp_ind = el.getAttribute('data-game-ind')

		if(temp_ind > 0) {
			var prevGame = allGames[(temp_ind - 1)]
			prevGame.style.setProperty('--colorbelow', el.getAttribute('data-colorBelow'))
		}
		

		el.classList.remove('staticWideImage');
	}

	el.classList.add('coverStyle');

	// finally, set the background image to the GIF
	var gifURL = 'url(' + gifAttr + ')';
	el.style.backgroundImage = gifURL;
}

function stopGif(el) {
	// stop the GIF and default to image
	var imgURL = 'url(' + el.getAttribute('data-img') + ')';
	el.style.backgroundImage = imgURL;

	// if this is a static wide image
	// re-add the old class (staticWideImage)
	// and inform game above us (in the list) that our color has changed back
	if(el.getAttribute('data-type') == 'static-wide') {
		var temp_ind = el.getAttribute('data-game-ind')

		if(temp_ind > 0) {
			var prevGame = allGames[(temp_ind - 1)]
			prevGame.style.setProperty('--colorbelow', el.getAttribute('data-swdColorBelow'))
		}

		el.classList.add('staticWideImage');
		el.classList.remove('coverStyle');
	}
}

function convertAllToColorPalette() {
    allGames = document.getElementsByClassName('horizontalContainer')
    numGames = allGames.length

    for(var i = 0; i < allGames.length; i++) {
    	var curGame = allGames[i]

    	// first, default background image to the IMAGE
    	var imageUrl = 'url(' + curGame.getAttribute('data-img') + ')';
    	curGame.style.backgroundImage = imageUrl

    	// add staticWideImage class if needed
    	if(curGame.getAttribute('data-type') == 'static-wide') {
    		curGame.classList.add('staticWideImage')
    	} else {
    		curGame.classList.add('coverStyle')
    	}

    	// add mouse over and mouse out events
    	curGame.addEventListener('mouseenter', function(ev) { playGif(this) }, false)
    	curGame.addEventListener('mouseleave', function(ev) { stopGif(this) }, false)

    	// TO DO: Test if this even works???
    	//curGame.addEventListener('touchstart', function(ev) { playGif(this) }, false)
    	//curGame.addEventListener('touchend', function(ev) { stopGif(this) }, false)

    	// set z-index for this thing
    	// (z-indices only get lower down the page => we must also use this to show the blurred background on coverStyles)
    	curGame.style.setProperty('--zval', 100-i*2)

    	curGame.setAttribute('data-game-ind', i);

		// create new img (colorThief needs an image HTML element to work)
    	// (background-image doesn't work)
    	var img = document.createElement('img'); 
    	img.setAttribute('data-game-ind', i)

    	img.crossOrigin = 'Anonymous';
    	
    	// actually set the image source
    	img.src = curGame.getAttribute('data-img');

    	// also load the GIF (if available) => this causes it to preload, so there's no delay when somebody hovers to display GIF
    	if(curGame.getAttribute('data-gif') !== 'null') {
	    	var gifPreload = document.createElement('img');
	    	gifPreload.src = curGame.getAttribute('data-gif');
    	}


    	// check image attribute => if it's null, set to default colors
    	var imgAttr = curGame.getAttribute('data-img')
    	if(imgAttr == 'null') {
    		img.addEventListener('error', function() {
    			createColorPalette(this, true)
    		})

    	// otherwise ...
    	} else {
    		// remove the gradient at the top if this is the first game
	    	if(i == 0) {
	    		curGame.querySelector('.horizontalContainerTransition').style.display = 'none';
	    	}


        	// wait for image to load before executing logic on it
        	img.addEventListener('load', function() {
        		createColorPalette(this);
        	});
    	}

    }
}

function autoplayOnMobile() {
    // automatically play first gif (if it exists) 
	// on devices with a small width
	// NOTE: Upgraded this to play all GIFs it can find => I think that will look better on mobile
	if(window.innerWidth < 600 && allGames.length > 0) {
		for(var i = 0; i < allGames.length; i++) {
			playGif(allGames[i]);
		}
	}
}

window.onload = function() {
	// convert all game containers to their color palette
	convertAllToColorPalette()

	// load the current quest
	// TO DO: It's not good practice to combine these two into a single file
	//        => I should attach a global/genereal event listener to onload, and allow it to call the functions in separate files
	loadCurrentQuest();

	// convert game/quest objects
	convertGameObjects();
}