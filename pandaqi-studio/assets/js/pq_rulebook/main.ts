import Rulebook from "./rulebook";

const rulebook = new Rulebook();
rulebook.load();
//@ts-ignore
window.PQ_RULEBOOK = rulebook;