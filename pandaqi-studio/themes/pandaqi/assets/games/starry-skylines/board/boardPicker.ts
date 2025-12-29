import BoardGeneration from "./boardGeneration";

// @NOTE: looks silly, but this is a really old project where both generation/picking and drawing are intertwined and I don't want to pull them apart
export const boardPicker = () => { return new BoardGeneration(); }