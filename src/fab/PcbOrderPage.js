import PcbAssemblyPage from "./PcbAssemblyPage.js";

export default class PcbOrderPage {
	constructor() {

	}

	async waitForLoad() {
		//console.log("waiting for pcb order page...");
		let url=this.manager.browserPage.url();
		//console.log("url: "+url);

		await this.manager.waitForIdle();
		//console.log("pcb order page done...");
	}

	async uploadGerbers(fn) {
		let reUploadButton=await this.manager.browserPage.evaluateHandle(()=>{
			let els=Array.from(document.querySelectorAll("a")).filter(el=>el.innerText.includes("Re-Upload"));
			console.log("reupload els:",els);
			if (els.length)
				return els[0];
		});

		if (reUploadButton && await reUploadButton.jsonValue()) {
			let navWait=this.manager.browserPage.waitForNavigation({timeout: 60000});
			await reUploadButton.click();
			await navWait;
			await manager.waitForIdle();
		}

		let uploadFileButton=await this.manager.browserPage.$("#uploadFile");

		await uploadFileButton.uploadFile(fn);
		await this.manager.browserPage.waitForSelector('.el-progress-bar');
		await this.manager.browserPage.waitForSelector('.el-progress-bar', { hidden: true });
		await new Promise(r=>setTimeout(r,1000));
		await this.manager.waitForIdle();
		await new Promise(r=>setTimeout(r,1000));
	}

	async enableAssembly() {
		await new Promise(r=>setTimeout(r,1000));
		let assyBtn=await this.manager.browserPage.$("#smtQuoteRef .switch-btn");
		await assyBtn.scrollIntoView();
		await assyBtn.click();
		await new Promise(r=>setTimeout(r,1000));
		await this.manager.waitForIdle();
		await new Promise(r=>setTimeout(r,1000));
	}

	async next() {
		await this.manager.browserPage.waitForSelector("button#savetocart");
		await new Promise(r=>setTimeout(r,1000));
		let saveBtn=await this.manager.browserPage.$("#savetocart");
		await saveBtn.scrollIntoView();
		await new Promise(r=>setTimeout(r,1000));

		this.manager.setPage(new PcbAssemblyPage());

		let saveWait=this.manager.browserPage.waitForNavigation({timeout: 60000});
		await saveBtn.click();
		await saveWait;

		await this.manager.page.waitForLoad();
	}
}