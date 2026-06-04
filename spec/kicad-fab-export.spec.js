import {dirnameFromImportMeta} from "../src/utils/node-util.js";
import {kicadFabExport} from "../src/app/kicad-fab-export.js";
import path from "path";

jasmine.DEFAULT_TIMEOUT_INTERVAL=60000;

let __dirname=dirnameFromImportMeta(import.meta);

describe("kicad-fab-export",()=>{
	it("can export",async ()=>{
		await kicadFabExport({
			pcb: path.join(__dirname,"relay.kicad_sch"),
			output: path.join(__dirname,"relay.out"),
			footprintDirs: ["/home/micke/Repo.ext/kicad-footprints/","/home/micke/Repo/peabrain/pcb/"]
		});
	});
});
