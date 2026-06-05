export class PageRequestObserver extends EventTarget {
	constructor(page) {
		super();

		this.page=page;
		this.page.on("request",this.onRequest);
		this.page.on("requestfinished",this.onRequestFinalized);
		this.page.on("requestfailed",this.onRequestFinalized);
		this.requests=[];
	}

	onRequest=(req)=>{
		this.requests.push(req)
		this.dispatchEvent(new Event("requestsChange"));
	}

	onRequestFinalized=(req)=>{
		let idx=this.requests.indexOf(req);
		if (idx<0) {
			console.log("warning... finalized req not found...")
			return;
		}

		this.requests.splice(idx,1);
		this.dispatchEvent(new Event("requestsChange"));
	}

	isIdle(state={ignore: [], max: 0}) {
		if (!state.ignore)
			state.ignore=[];

		if (!state.max)
			state.max=0;

		let count=0;

		for (let req of this.requests) {
			let u=String(req.url());
			let ignored=false;
			for (let ig of state.ignore)
				if (u.includes(ig))
					ignored=true;

			//console.log(u,ignored);
			if (!ignored)
				count++;
		}

		let idle=(count<=state.max);
		/*if (!idle && count<=3)
			console.log("waiting... ",this.requests.map(r=>r.url()))*/

		//console.log("count",count,"max",state.max,"idle",(count<=state.max));
		return idle;
	}

	async waitForIdle(params) {
		if (this.isIdle(params))
			return;

		await new Promise(resolve=>{
			let longWait;
			let waitInterval=setInterval(()=>{
				longWait=true;
				console.log("still waiting...",this.requests.map(r=>r.url()));
			},10000);

			function check() {
				if (this.isIdle(params)) {
					if (longWait)
						console.log("done waiting...");
					this.removeEventListener("requestsChange",check);
					clearInterval(waitInterval);
					resolve();
				}

				else {
					/*if (this.requests.length<=3)
						console.log("check... ",this.requests.length,this.requests.map(r=>r.url()));*/
				}
			}

			//console.log("waiting...");
			this.addEventListener("requestsChange",check);
		});
	}
}
