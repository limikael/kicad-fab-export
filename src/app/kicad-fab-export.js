import FootprintLibrary from "../pcb/FootprintLibrary.js";
import path from "node:path";
import fs, {promises as fsp} from "fs";
import {kicadCli} from "../pcb/kicad-util.js";
import {zipFilesFromDir} from "../utils/archiver-util.js";
import {parse as csvParse, stringify as csvStringify} from "csv/sync";

export async function kicadFabExport({pcb, footprintDir, tmpDir, output}) {
	let footprintLibrary=new FootprintLibrary({
		footprintDirs: footprintDir,
		projectDir: path.parse(pcb).dir
	});

	const base=path.join(path.parse(pcb).dir,path.parse(pcb).name);
	const pcbFile=base+".kicad_pcb";
	const schFile=base+".kicad_sch";

	if (!tmpDir)
		tmpDir=".kfe";

	let gerberDir=path.join(tmpDir,"gerbers");
	let outputDir=output;

	await fsp.rm(tmpDir,{recursive: true, force: true});
	await fsp.rm(outputDir,{recursive: true, force: true});
	await fsp.mkdir(gerberDir,{recursive: true});
	await fsp.mkdir(outputDir,{recursive: true});

	// Gerbers
	await kicadCli(["pcb","export","gerbers",pcbFile,
		"--layers", "F.Cu,B.Cu,F.Mask,B.Mask,F.SilkS,B.SilkS,Edge.Cuts",
		"-o",gerberDir
	]);

	await kicadCli(["pcb","export","drill",pcbFile,
		"-o",gerberDir
	]);

	await zipFilesFromDir(path.join(outputDir,"gerbers.zip"),gerberDir);

	// BOM
	await kicadCli(["sch","export","bom",schFile,
		"--fields","Reference,Footprint,Value,lcsc,lcscRot",
		"--group-by","none",
		"-o",path.join(tmpDir,"bom_raw.csv")
	]);

	let bom=csvParse(fs.readFileSync(path.join(tmpDir,"bom_raw.csv"),"utf8"),{
	    columns: true,
	    skip_empty_lines: true,
	    trim: true
	});

	let bomByReference={};

	let jlcBom=bom.map(row=>{
		bomByReference[row.Reference]=row;
		return ({
			Designator: row.Reference,
			Footprint: row.Footprint,
			Comment: row.Comment,
			"LCSC Part #": row.lcsc
		})
	});

	fs.writeFileSync(path.join(outputDir,"bom.csv"),csvStringify(jlcBom,{header: true}));

	// CPL
	await kicadCli(["pcb","export","pos",pcbFile,
		"--format","csv",
		"--units","mm",
		"-o",path.join(tmpDir,"cpl_raw.csv")
	]);

	let cpl=csvParse(fs.readFileSync(path.join(tmpDir,"cpl_raw.csv"),"utf8"),{
	    columns: true,
	    skip_empty_lines: true,
	    trim: true
	});

	function rotate([x, y], deg) {
		const rad = deg * Math.PI / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		return [
			x * cos - y * sin,
			x * sin + y * cos
		];
	}

	let jlcCpl=cpl.map(row=>{
		let bomEntry=bomByReference[row.Ref];
		let footprintName=bomEntry.Footprint;
		let footprint=footprintLibrary.getFootprint(footprintName);
		let centroid=footprint.getCentroid();
		let rot=parseFloat(row.Rot);
		let [cx,cy]=rotate(centroid,-rot);

		//console.log(bomEntry);

		let Rotation=parseFloat(row.Rot);
		if (bomEntry.lcscRot)
			Rotation+=parseFloat(bomEntry.lcscRot);

		return ({
			Designator: row.Ref,
			"Mid X": `${parseFloat(row.PosX)+cx}mm`,
			"Mid Y": `${parseFloat(row.PosY)-cy}mm`,
			Layer: row.Side === "top" ? "Top" : "Bottom",
			Rotation: Rotation
		});
	});

	fs.writeFileSync(path.join(outputDir,"cpl.csv"),csvStringify(jlcCpl,{header: true}));

}