import Game from "games/photomone-digital-antists/js_game/game"

async function startPhotomoneGame(config)
{
    const fontURL = "/photomone/assets/fonts/GelDoticaLowerCaseThick.woff2";
	const fontFile = new FontFace("GelDoticaLowerCase", "url(" + fontURL + ")");
	document.fonts.add(fontFile);

	await fontFile.load();

    // the usual conversions from string to a number/bool
    config.width = window.innerWidth;
    config.height = window.innerHeight;
    config.pointRadiusFactor = 0.0175;
    config.pointRadiusSpecialFactor = 0.0175*1.9;
    config.lineWidthFactor = 0.0175;
    config.pointBounds = { min: 160, max: 185 };

    config.timerLength = parseFloat(config.timerLength || "45");
    config.resizePolicy = "full";
    config.wordInterface.listenToExpansions = false;

    config.debugPowerups = []; // @DEBUGGING (should be empty)

    window.PHOTOMONE_GAME = new Game(config);
}

window.startPhotomoneGame = startPhotomoneGame;

