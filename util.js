/* Util functions */

//console.log("Loaded utils!")

function isDefined(obj) {
	if (typeof obj !== "undefined") {
		return true;
	}
	return false;
}

function nwc(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
