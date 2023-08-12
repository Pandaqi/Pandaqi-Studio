const scaleFactor = 3.8;
var pdfImages = [];
var gameConfig = {};
const { jsPDF } = window.jspdf;

// 
// Converts the current game canvas into a downloadable image + PDF (and destroys original game)
// Input = reference ("this") to the Phaser game
//
function convertCanvasToImage(gameReference) {
	gameReference.time.addEvent({
	    delay: 200,
	    callback: function() {
	        var canv = document.getElementById('phaserContainer').firstChild;

			var img = new Image();
			img.src = canv.toDataURL();
			img.style.maxWidth = '100%';
			document.getElementById('phaserContainer').appendChild(img);
			document.getElementById('phaserContainer').style.overflow = "visible";

			pdfImages.push(img);

			GAME.destroy(true);

			document.getElementById('btn-generateBoard').disabled = false
			document.getElementById('btn-createPDF').style.display = 'inline-block';
	    },
	    loop: false
	})
}

//
// Start Phaser game (and thus board generation)
//
function startPhaser() {
	document.getElementById('phaserContainer').innerHTML = '';
	document.getElementById('btn-generateBoard').disabled = true

	var config = {
	    type: Phaser.CANVAS,
	    scale: {
	        mode: Phaser.Scale.FIT,
	        parent: 'phaserContainer',
	        autoCenter: Phaser.Scale.CENTER_BOTH,
	        width: gameConfig.size.width,
	        height: gameConfig.size.height
	    },

	    backgroundColor: '#FFFFFF',
	    parent: 'phaserContainer',
	    scene: [BoardGeneration],
	}

	window.GAME = new Phaser.Game(config); 
	GAME.scene.start('boardGeneration');

	document.getElementById('btn-createPDF').style.display = 'none';
}

document.getElementById('btn-generateBoard').addEventListener('click', function() {
	var randomSeedLength = Math.floor(Math.random() * 6) + 3;
	var randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, randomSeedLength);

	// general functions that are in (almost) all games
	gameConfig.seed = document.getElementById('setting-inputSeed').value || randomSeed;
	gameConfig.numPlayers = parseInt(document.getElementById('setting-playerCount').value) || 4
	gameConfig.inkFriendly = document.getElementById('setting-inkFriendly').checked || false
	gameConfig.expansions = {}

	gameConfig.size = { 'width': 297*scaleFactor, 'height': 210*scaleFactor }
	gameConfig.orientation = 'landscape'
	gameConfig.gameTitle = 'Untitled Game'

	// this function must be declared by the website; it depends on the specific settings for this game
	// (this can also override stuff like the size and orientation)
	generateGameConfig();

	// finally, actually start
	startPhaser();
});

//
// PDF creation
// (simply place all images full-size in a PDF, then save it to downloads)
//
function createPDF() {
	var pdfConfig = {
		orientation: gameConfig.orientation,
		unit: 'mm',
		format: [gameConfig.size.width, gameConfig.size.height]
	}

	var doc = new jsPDF(pdfConfig);
	var width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();

	// This simply places images, one per page, and creates a _new_ page each time after the first one
    // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    for(var i = 0; i < pdfImages.length; i++) {
    	if(i > 0) { doc.addPage(); }
    	
    	doc.addImage(pdfImages[i], 'png', 0, 0, width, height);
    }

    doc.save(gameConfig.gameTitle + ' (Seed: ' + gameConfig.seed + ').pdf');
}

document.getElementById('btn-createPDF').addEventListener('click', function() {
	createPDF();
})