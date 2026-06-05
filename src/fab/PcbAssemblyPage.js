import CartPage from "./CartPage.js";

export default class PcbAssemblyPage {
	constructor() {

	}

	async waitForLoad() {
		let url=this.manager.browserPage.url();
		//console.log("url: "+url);
		if (!url.includes("https://cart.jlcpcb.com/smt-order/"))
			throw new Error("Unexpected url for assembly page");

		await this.manager.waitForIdle();
		//console.log("pcb order page done...");
	}

	async uploadBomAndCpl(bomFn, cplFn) {
		if (await this.getCurrentTab()!="bom")
			throw new Error("wrong tab");

		let uploadBtns=await this.manager.browserPage.$$("#pane-SmtBill input")
		if (uploadBtns.length!=2)
			throw new Error("Expected 2 file buttons");

		await uploadBtns[0].uploadFile(bomFn);
		await uploadBtns[1].uploadFile(cplFn);

		await this.manager.browserPage.waitForSelector("#pane-SmtBill .FileItem:nth-child(1) .uploaded-content");
		await this.manager.browserPage.waitForSelector("#pane-SmtBill .FileItem:nth-child(2) .uploaded-content");

		let nextBtn=await this.manager.browserPage.$("#pane-SmtBill button.next-btn");
		await nextBtn.click();

		await new Promise(r=>setTimeout(r,1000));
		await this.manager.waitForIdle();

		await this.manager.browserPage.waitForSelector("#pane-SmtBill .SmtBill-actions button.next-button");
		let nextAfterBomBtn=await this.manager.browserPage.$("#pane-SmtBill .SmtBill-actions button.next-button");
		await nextAfterBomBtn.click();

		await new Promise(r=>setTimeout(r,1000));
		await this.manager.waitForIdle();

		let tab=await this.getCurrentTab();
		if (tab!="component")
			throw new Error("wrong tab after bom");
	}

	async getCurrentTab() {
		let elh,className;

		elh=await this.manager.browserPage.$("#tab-SmtPcb");
		className=await elh.evaluate(el=>el.className);
		if (className.includes("is-active"))
			return "pcb";

		elh=await this.manager.browserPage.$("#tab-SmtBill");
		className=await elh.evaluate(el=>el.className);
		if (className.includes("is-active"))
			return "bom";

		elh=await this.manager.browserPage.$("#tab-SmtCompnent");
		className=await elh.evaluate(el=>el.className);
		if (className.includes("is-active"))
			return "component";

		elh=await this.manager.browserPage.$("#tab-SmtQuote");
		className=await elh.evaluate(el=>el.className);
		if (className.includes("is-active"))
			return "quote";
	}

	async selectCategoryAndSaveToCart() {
		let tab=await this.getCurrentTab();
		if (tab!="quote")
			throw new Error("wrong tab for save");

		await (await this.manager.browserPage.$("#pane-SmtQuote .cascader input")).click();
		await new Promise(r=>setTimeout(r,1000));
		await (await this.manager.browserPage.$(".el-cascader-panel .el-cascader-menu:nth-child(1) li:nth-child(5)")).click();
		await new Promise(r=>setTimeout(r,1000));
		await (await this.manager.browserPage.$(".el-cascader-panel .el-cascader-menu:nth-child(2) li:nth-child(3)")).click();
		await new Promise(r=>setTimeout(r,1000));

		await (await this.manager.browserPage.$("button.save-to-cart")).click();

		await this.manager.browserPage.waitForNavigation({timeout: 60000});
		this.manager.setPage(new CartPage());
		await this.manager.waitForPageLoad();
	}

	async next() {
		switch (await this.getCurrentTab()) {
			case "pcb":
				let pcbNextBtn=await this.manager.browserPage.$("button.next-btn");
				await pcbNextBtn.click();
				await this.manager.waitForIdle();
				let newTab=await this.getCurrentTab();
				if (newTab!="bom")
					throw new Error("unexpected tab");
				break;

			case "component":
				await this.manager.browserPage.waitForSelector("#pane-SmtCompnent .footer button.next-btn");
				let nextOnComp=await this.manager.browserPage.$("#pane-SmtCompnent .footer button.next-btn");
				await nextOnComp.scrollIntoView();
				await new Promise(r=>setTimeout(r,1000));
				await nextOnComp.click();

				//console.log("comp done...");
				await new Promise(r=>setTimeout(r,1000));
				await this.manager.waitForIdle();
				let compNewTab=await this.getCurrentTab();
				if (compNewTab!="quote")
					throw new Error("unexpected tab after comp");
				break;

			default:
				throw new Error("Can't next from: "+await this.getCurrentTab());
		}
	}
}