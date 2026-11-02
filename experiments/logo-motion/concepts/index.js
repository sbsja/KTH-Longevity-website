import strands from "./strands.js";
import focus from "./focus.js";
import division from "./division.js";
import molecules from "./molecules.js";
import glass from "./glass.js";
import connect from "./connect.js";

/** The six concepts, in the order of the brief. */
export const concepts = [strands, focus, division, molecules, glass, connect];

export const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
