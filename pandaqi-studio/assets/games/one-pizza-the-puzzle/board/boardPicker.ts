import BoardGeneration from "./boardGeneration";

// @TODO: bit silly, but this is a really old game and so the picking+drawing code is completely entangled and I don't feel like separating them now
export const boardPicker = () => { return new BoardGeneration(); }