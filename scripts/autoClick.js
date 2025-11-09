/* globals DomOutline */

var isClicking = false;
var clickingLoop;
var domSelector = DomOutline({ onClick: elementClicked, realtime: true });

domSelector.start();

function isDefined(obj) {
	if (typeof obj !== "undefined") {
		return true;
	}
	return false;
}

function elementClicked(e) {
	domSelector.stop();
	if (clickingLoop) {
		clearInterval(clickingLoop);
	}
	isClicking = true;
	chrome.storage.local.get( "autoClickDelay", function(data) {
		var delay = data["autoClickDelay"];
		clickingLoop = setInterval(function() {
			if (!isClicking) {
				clearInterval(clickingLoop);
				return;
			}
			if (e) {
				e.click();
			} else {
				isClicking = false;
				clearInterval(clickingLoop);
				return;
			}
		}, delay);
	});
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (isDefined(message.isClicking)) {
		//console.log("received is clicking request:", isClicking);
		sendResponse(isClicking);
		if (!isClicking) {
			domSelector.stop();
		}
	} else if (isDefined(message.stopClicking)) {
		//console.log("stopping clicking");
		isClicking = false; 
		if (domSelector) { 
			domSelector.stop(); 
		}
	}
	return true;
});
