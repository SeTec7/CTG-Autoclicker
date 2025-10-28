/* globals chrome, DomOutline, delay */

var clicking = false;
var delay;
var clickingLoop;
var domSelector = DomOutline({ onClick: elementClicked, realtime: true });

domSelector.start();

function isDefined(obj) {
	if (typeof obj !== "undefined") {
		return true;
	}
	return false;
}

async function elementClicked(e) {
	domSelector.stop();
	if (clickingLoop) {
		clearInterval(clickingLoop);
	}
	//clicking = true;
	chrome.storage.sync.set({ autoClickActive: true });
	await chrome.storage.sync.get( "autoClickDelay", function(data) {
		if (chrome.runtime.lastError) return;
		if(isDefined(data["autoClickDelay"])) {
			clickingLoop = setInterval(function() {
			if (e) {
				e.click();
			} else {
				chrome.storage.sync.set({ autoClickActive: false });
				if (domSelector) domSelector.stop();
				//clicking = false;
			}
			chrome.storage.sync.get( "autoClickActive", function(data) {
				if(isDefined(data["autoClickActive"])) {
					if (!data["autoClickActive"]) {
						clearInterval(clickingLoop);
						if (domSelector) domSelector.stop();
					}
				}
			});
			// if (!clicking) {
			// 	clearInterval(clickingLoop);
			// }
			}, data["autoClickDelay"]);
		}
	});


}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (isDefined(message.isClicking)) {
		console.log("received is clicking request");
		sendResponse(clicking);
		if (!clicking) {
			domSelector.stop();
		}
	} else if (isDefined(message.setAutoClickDelay)) {
		console.log("autoclicker caught delay update");
		delay = message.setAutoClickDelay;
	} else if (isDefined(message.stopClicking)) {
		console.group("stopping clicking");
		clicking = false; 
		if (domSelector) { 
			domSelector.stop(); 
		}
	}
});
