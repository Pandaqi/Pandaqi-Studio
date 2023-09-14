/*
 *
 * All the different, unique actions
 * (get the actions from the current scenario, give them all an onClick event)
 *
 */
function createActionButton(id, defaultEvent = true) {
	var btn = document.createElement('button');
	//btn.innerHTML = ACTIONS[a].label;

	btn.innerHTML = '<span class="icon ' + ACTIONS[id].icon + '"></span>';

	btn.id = id;
	btn.classList.add("action");

	if(defaultEvent) {
		btn.addEventListener("click", function(ev) {
			STATE.gotoGameInterface(ev.currentTarget.id);
		});
	}

	document.getElementById('action-buttonList').appendChild(btn);

	return btn;
}

var includedActions = SCENARIOS[cfg.scenario].actions;

for(var i = 0; i < includedActions.length; i++) {
	var a = includedActions[i];
	createActionButton(a)
}

/*
 *
 * Unified functions for general buttons
 *
 */

// CANCEL and CONFIRM buttons (for actions)
document.getElementById('action-cancel').addEventListener('click', function(ev) {
	GAME.scene.keys.mainGame.clearSelectionArea();

	document.getElementById('move-instruction').innerHTML = '<span class="error-message">Action cancelled.</span> Pick again:';
	STATE.gotoActionList();
})

document.getElementById('action-confirm').addEventListener('click', function(ev) {

	document.getElementById('move-instruction').innerHTML = '<span class="success-message">Action succeeded!</span> New player, pick your action:';
	GAME.scene.keys.mainGame.closeAction();
});

// the X in the top-right corner to close the feedback/results from previous turn
document.getElementById('close-results').addEventListener('click', function(ev) {
	STATE.toggleMoveResults(false);
});

// clicking anywhere in the popup area closes it
document.getElementById('popup').addEventListener('click', function(ev) {
	var obj = ev.currentTarget;
	if(obj.style.display != 'block') { return; }

	ev.currentTarget.style.display = 'none';
});


// We only need to setup the monster screen
// (all other screens are fixed; their content/functionality doesn't depend on current config)
STATE.initializeMonsterScreen();