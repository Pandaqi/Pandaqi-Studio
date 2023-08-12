const BoardGeneration = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BoardGeneration()
    {
        Phaser.Scene.call(this, { key: 'boardGeneration' });
    },

    preload: function() {
      this.load.crossOrigin = 'Anonymous';
      this.canvas = this.sys.game.canvas;

      var base = 'assets/';

      // @TODO: Load assets here
    },

    create: function() {
    	this.setupBoard();
    	this.generateBoard();
    	this.visualizeBoard();
    },

    setupBoard: function() {
    	// @TODO: Use this to set global properties (number of cells, number of locations, sizes of things, etc.)
    	this.cfg = {};

    	// @TODO: Also prepare lists (of all possible items, curses, etc.)
    },

    generateBoard: function() {

    },

    visualizeBoard: function() {

    },
});