import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import repl from 'node:repl';
import {PageRequestObserver} from "./pup-util.js";
import CartPage from "./CartPage.js";

puppeteer.use(StealthPlugin());

export default class JlcManager {
	constructor() {
		this.setPage(new CartPage());
	}

	async waitForIdle() {
		await this.observer.waitForIdle({ignore: [
			"https://overseas-datasink.jlcpcb.com/datacollect/dataAccess/logs",
			"clarity.ms",
			"https://statistic.live.126.net",
			"https://analytics.tiktok.com/api/v2/pixel/inter",
			"https://px.ads.linkedin.com",
			"https://www.facebook.com",
			"https://statistic-overseas.yunxinfw.com",
			"https://cart.jlcpcb.com/api/overseas-core-platform/shoppingCart/calculateGoodsFreight",
			"https://cart.jlcpcb.com/api/overseas-core-platform/shoppingCart/calculationGoodsCostsNew",
		]});
	}

	async launch() {

		//	userDataDir: "/home/micke/.config/chromium/Default"

		this.browser = await puppeteer.launch({
			headless: false,
			//executablePath: "/usr/bin/chromium-browser",
			userDataDir: ".data"
		});

		let pages=await this.browser.pages();
		this.browserPage=await this.browser.newPage();
		for (let p of pages)
			await p.close();

		this.observer=new PageRequestObserver(this.browserPage);
	}

	setPage(page) {
		this.page=page;
		page.manager=this;
	}

	async waitForPageLoad() {
		await this.page.waitForLoad();
	}

	async close() {
		await this.browser.close();
	}
}