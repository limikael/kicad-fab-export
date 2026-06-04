#!/usr/bin/env node

import {program} from "commander";
import {kicadFabExport} from "./kicad-fab-export.js";
import {arrayify} from "../utils/js-util.js";

program
    .description("Compile JLCPCB friendly files from KiCad pcb.")
    .requiredOption("-o, --output <dir>","Output dir")
    .argument("<pcb>","Pcb file.")
    .showHelpAfterError()

program.option(
	"-F, --footprint-dir <path>",
	"Footprint directory (multiple allowed)",
	(value, previous)=>[...arrayify(previous),value],
	[]
);

await program.parseAsync();
await kicadFabExport({
	pcb: program.args[0],
	...program.opts()
});
