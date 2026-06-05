import PcbOrderPage from "./PcbOrderPage.js";

export default class CartPage {
	constructor() {

	}

	async isLoggedIn() {
		let elh=await this.manager.browserPage.$("nav .sign-in-btn");
		let s=(await elh.evaluate(el=>el.innerText)).trim();;
		return (s=="My Account")
	}

	async goto() {
		await this.manager.browserPage.goto("https://cart.jlcpcb.com/shopcart/cart",{timeout: 60000});
	}

	async waitForLoad() {
		let url=this.manager.browserPage.url();
		if (url!="https://cart.jlcpcb.com/shopcart/cart")
			throw new Error("Unexpected page for cart");

		await this.manager.waitForIdle();
	}

	async getOrderNames() {
		let elhs=await manager.browserPage.$$(".main-cart-list");
		return await Promise.all(elhs.map(async elh=>
			await elh.evaluate(el=>el.querySelector(".main-cl-name div").innerText)
		));
	}

	async openOrder(orderName) {
		let orderNames=await this.getOrderNames();
		let index=orderNames.indexOf(orderName);
		if (index<0)
			throw new Error("No such order: "+orderName);

		let listItemHandle=await this.manager.browserPage.$(`.main-cart-list:nth-child(${index+1})`);
		let buttonHandle=await listItemHandle.evaluateHandle(el=>Array.from(el.querySelectorAll("div")).filter(el=>el.innerText=="Edit Order")[0]);

		await buttonHandle.click();
		await this.manager.browserPage.waitForNavigation();
		this.manager.setPage(new PcbOrderPage(orderName));

		await this.manager.page.waitForLoad();
	}

	async newOrder() {
		await this.manager.browserPage.goto("https://cart.jlcpcb.com/quote");
		this.manager.setPage(new PcbOrderPage());
		await this.manager.page.waitForLoad();
	}
}