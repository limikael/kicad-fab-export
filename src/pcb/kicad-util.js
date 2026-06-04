import {runCommand} from "../utils/node-util.js";

export async function kicadCli(args) {
	return await runCommand("flatpak",[
	    "run","--command=kicad-cli","org.kicad.KiCad",
	    ...args
	]);
}