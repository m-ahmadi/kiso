define(() => {

	function determineHost() {
		const hName = window.location.hostname;
		let res;
		if (hName) {	
			if (hName === "localhost" || hName === "127.0.0.1") {
				res = `${hName}:1081`;
			} else if (hName === "80.85.82.83" || hName === "10.10.200.64") {
				res = `${hName}:8081`;
			}
		}
		return res;
	}
	
	return { determineHost };
});