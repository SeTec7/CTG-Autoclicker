/* Util functions */

console.log("Loaded utils!")

function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = chrome.tabs.query(queryOptions);
    return tab;
}

function isDefined(obj) {
	if (typeof obj !== "undefined") {
		return true;
	}
	return false;
}

function nwc(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
