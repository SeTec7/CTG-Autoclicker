/* globals */

// Service worker currently only serves as source of truth for the current tab and global initialization

var session = {
	currentTab: {}
};

loadSession();

function loadSession() {
	// Our only shared variable, delay for the auto-clicker, set default on first load
	// Saved locally only, no cloud sync
	chrome.storage.local.get( "autoClickDelay", function(data) {
		if (!isDefined(data["autoClickDelay"])) {
			console.log("No autoclick delay set, setting default of 10");
			chrome.storage.local.set({ autoClickDelay: 10 }, function() {
				if (chrome.runtime.lastError) return;
			});
		}
	});

	// Load the current tab into session info
	loadCurrentTab();
}

// Current tab detection hooks
function loadCurrentTab() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(results) {
		if (results.length > 0) {
			session.currentTab = results[0];
		}
	});
}
function onUpdateTab(tabId, changeInfo, tab) {loadCurrentTab()}
chrome.tabs.onUpdated.addListener(onUpdateTab);
function onRemoveTab(tabId, removeInfo) {loadCurrentTab();}
chrome.tabs.onRemoved.addListener(onRemoveTab);
function onActivatedTab(activeInfo) {loadCurrentTab();}
chrome.tabs.onActivated.addListener(onActivatedTab);
function onWindowFocus(windowId) {loadCurrentTab();}
chrome.windows.onFocusChanged.addListener(onWindowFocus);

// Service worker message handler
function onMessageReceived(message, sender, sendResponse) {
	if (isDefined(message.getCurrentTab)) {
		sendResponse(session.currentTab);
	}
	return true;
}
chrome.runtime.onMessage.addListener(onMessageReceived);

function isDefined(obj) {
	if (typeof obj !== "undefined") {
		return true;
	}
	return false;
}
