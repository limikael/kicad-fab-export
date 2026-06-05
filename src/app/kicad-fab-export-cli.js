#!/usr/bin/env node

import {program} from "commander";
import {kicadFabExport, kicadFabExportLogin} from "./kicad-fab-export.js";
import {arrayify} from "../utils/js-util.js";

program
    .description("Compile JLCPCB friendly files from KiCad pcb.")
    .option("-o, --output <dir>","Output dir.")
    .option("--login","Login to fab.")
    .option("--no-process","Don't process.")
    .option("--no-upload","Don't upload.")
    .option("--no-clean","Don't remove existing orders.")
    .option("--open-repl","Leave browser open and enter repl.")
    .argument("[pcb]","Pcb file.")
    .showHelpAfterError()

program.option(
	"-F, --footprint-dir <path>",
	"Footprint directory (multiple allowed)",
	(value, previous)=>[...arrayify(previous),value],
	[]
);

await program.parseAsync();
let options=program.opts();
options.pcb=program.args[0];

if (options.login) {
	await kicadFabExportLogin();
}

else {
	if (!options.pcb) {
		console.log("error: required argument pcb missing.");
		console.log();
		program.help();
		process.exit(1);
	}

	await kicadFabExport(options);
}
