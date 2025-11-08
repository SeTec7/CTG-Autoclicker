/* globals chrome */

importScripts('util.js')

var session = {
	currentTab: {},
	installReason: null,
	platformInfo: {},
	plugins: {},
	settings: {},
	localStorageRemaining: 0,
	temp: {},
	enabled: true,
	newPlugins: 0,
	customUpdateMessage: ""
};
var scripts = {
	getLocalBytesRemaining: getLocalBytesRemaining,
	pauseAllTabsGo: pauseAllTabsGo,
	autoScrollGo: autoScrollGo,
	autoScrollStop: autoScrollStop,
	setRevealPassword: setRevealPassword
};
loadSession();
loadCurrentTab();
chrome.tabs.onUpdated.addListener(onUpdateTab);
chrome.tabs.onRemoved.addListener(onRemoveTab);
chrome.tabs.onActivated.addListener(onActivatedTab);
chrome.windows.onFocusChanged.addListener(onWindowFocus);
chrome.runtime.onMessage.addListener(onMessageReceived);

chrome.runtime.onInstalled.addListener(function(object) {
	if (object.reason == "install") {
		session.installReason = "install";
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL("options.html"));
		}
		chrome.storage.sync.set({ lastUpdate: Date.now() }, function() {
			if (chrome.runtime.lastError) {
				return;
			}
		});
		chrome.storage.sync.set({ pluginCount: Object.keys(session.plugins).length }, function() {
			if (chrome.runtime.lastError) {
				return;
			}
		});
	} else if (object.reason == "update") {
		syncLoad("pluginCount", function(val) {
			var pluginCount = Object.keys(session.plugins).length;
			if (val != null && pluginCount > val) {
				session.newPlugins = pluginCount - val;
			}
			syncLoad("lastUpdate", function(val) {
				if (val == null || Date.now() - val > 302400000 || session.newPlugins || session.customUpdateMessage.length > 0) {
					session.installReason = "update";
					//chrome.browserAction.setBadgeText({ text: "NEW" });
					//chrome.browserAction.setBadgeBackgroundColor({ color: "#0000FF" });
					chrome.storage.sync.set({ updateNotification: true }, function() {
						if (chrome.runtime.lastError) {
							return;
						}
					});
					chrome.storage.sync.set({ lastUpdate: Date.now() }, function() {
						if (chrome.runtime.lastError) {
							return;
						}
					});
				}
			});
		});
	}
});

function loadCurrentTab() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(results) {
		if (results.length > 0) {
			session.currentTab = results[0];
			// chrome.scripting.executeScript({ 
			// 	target: { tabId: session.currentTab.id },
			// 	func: () => {
			// 		if (chrome.runtime.lastError) {
			// 			session.enabled = false;
			// 		} else {
			// 			session.enabled = true;
			// 		}
			// 	},
			// });
		}
	});
}

function onUpdateTab(tabId, changeInfo, tab) {
	loadCurrentTab()
}

function onRemoveTab(tabId, removeInfo) {
	loadCurrentTab();
}

function onActivatedTab(activeInfo) {
	loadCurrentTab();
}

function onWindowFocus(windowId) {
	loadCurrentTab();
}

function onMessageReceived(message, sender, sendResponse) {
	if (isDefined(message.getCurrentTab)) {
		sendResponse(session.currentTab);
	} else if (isDefined(message.getPluginInfo)) {
		if(isDefined(message.getPluginInfo.name)) {
			//console.log("Sending plugin info for", message.getPluginInfo.name)
			sendResponse(session.plugins[message.getPluginInfo.name]);
		} else {
			//console.log("Sending all plugin info");
			sendResponse(session.plugins);
		}		
	}
	return true;
}

function loadSession() {
	chrome.storage.sync.clear();
	console.log("Cleared all sync storage");
	chrome.storage.local.get( "autoClickDelay", function(data) {
		if (!isDefined(data["autoClickDelay"])) {
			console.log("No autoclick delay set, setting default of 10");
			chrome.storage.local.set({ autoClickDelay: 10 }, function() {
				if (chrome.runtime.lastError) return;
			});
		}
	});

	session.plugins = {
		autoScroll: {
			enabled: true,
			speed: 10,
			shortcut: ""
		},
		focus: {
			enabled: true
		},
		pauseAllTabs: {
			enabled: true,
			shortcut: ""
		},
		revealPassword: {
			enabled: true
		},
		youtubeExtractCaptions: {
			enabled: true
		},
		passwordGenerator: {
			enabled: true,
			lastPopupId: -2
		},
		autoClick: {
			enabled: true,
			delay: 10
		},
		customPlugins: {
			plugins: []
		}
	};

	session.settings = {
		hideUnavailable: true
	};

	var pluginKeys = Object.keys(session.plugins);
	session.pluginLoadRemaining = pluginKeys.length;
	for (var i = 0; i < pluginKeys.length; i++) {
		getEnabledStatus(pluginKeys[i]);
	}

	syncLoad("hideUnavailable", function(val) {
		if (val != null) {
			session.settings.hideUnavailable = val;
		}
	});

	syncLoad("autoScrollSpeed", function(val) {
		if (val != null) {
			session.plugins["autoScroll"].speed = val;
		}
	});

	localLoad("autoClickDelay", function(val) {
		if (val != null) {
			session.plugins["autoClick"].delay = val;
		}
	});

	syncLoad("autoScrollShortcut", function(val) {
		if (val != null) {
			session.plugins["autoScroll"].shortcut = val;
		}
	});

	syncLoad("pauseAllTabsShortcut", function(val) {
		if (val != null) {
			session.plugins["pauseAllTabs"].shortcut = val;
		}
	});

	getLocalBytesRemaining();

	chrome.runtime.getPlatformInfo(function(info) {
		if (chrome.runtime.lastError) {
			return;
		}
		session.platformInfo = info;
	});

	syncLoad("updateNotification", function(val) {
		if (val != null && val) {
			session.installReason = "update";
			//chrome.browserAction.setBadgeText({ text: "NEW" });
			//chrome.browserAction.setBadgeBackgroundColor({ color: "#0000FF" });
			syncLoad("pluginCount", function(val) {
				var pluginCount = Object.keys(session.plugins).length;
				if (val != null && pluginCount > val) {
					session.newPlugins = true;
				}
			});
		}
	});
}

function doneLoading() {
	if (session.plugins.revealPassword.enabled) {
		setRevealPassword(true);
	}
}

function setRevealPassword(enabled) {
	if (enabled) {
		createContextMenu({
			id: "revealPassword",
			title: "Reveal/Hide Passwords",
			contexts: ["editable"],
			onclick: function(info, tab) {
				chrome.scripting.executeScript(
					tab.id,
					{
						file: "plugins/revealPassword.js",
						frameId: info.frameId,
						matchAboutBlank: true
					},
					function() {
						if (chrome.runtime.lastError) {
							return;
						}
					}
				);
			}
		});
	} else {
		removeContextMenus("revealPassword");
	}
}

function createContextMenu(options) {
	chrome.contextMenus.create(options, function() {
		if (chrome.runtime.lastError) {
			return;
		}
	});
}

function removeContextMenus(name) {
	chrome.contextMenus.remove(name, function() {
		if (chrome.runtime.lastError) {
			return;
		}
	});
}

function getEnabledStatus(plugin) {
	syncLoad(plugin + "Enabled", function(val) {
		if (val != null) {
			session.plugins[plugin].enabled = val;
		}
		if (--session.pluginLoadRemaining == 0) {
			doneLoading();
		}
	});
}

function autoScrollHandler(height, sender) {
	if (!isDefined(session.temp.autoScrollInit)) {
		session.temp.autoScrollInit = { frameId: 0, height: 0 };
		setTimeout(function() {
			chrome.tabs.sendMessage(getCurrentTab().id, { q: "scrollDiv" }, { frameId: session.temp.autoScrollInit.frameId }, function() {
				if (chrome.runtime.lastError) {
					return;
				}
			});
			delete session.temp.autoScrollInit;
		}, 500);
	}
	if (height > session.temp.autoScrollInit.height) {
		session.temp.autoScrollInit.frameId = sender.frameId;
		session.temp.autoScrollInit.height = height;
	}
}

function keyboardShortcutHandler(obj) {
	var pluginKeys = Object.keys(session.plugins);
	for (var i = 0; i < pluginKeys.length; i++) {
		if (isDefined(session.plugins[pluginKeys[i]].shortcut) && session.plugins[pluginKeys[i]].shortcut.length == 1) {
			var shortcut = session.plugins[pluginKeys[i]].shortcut;
			if (obj.altKey && shortcut.charCodeAt(0) === obj.code) {
				if (pluginKeys[i] == "pauseAllTabs") {
					pauseAllTabsGo();
				} else if (pluginKeys[i] == "autoScroll") {
					chrome.tabs.sendMessage(getCurrentTab().id, { q: "scrolling" }, function(scrolling) {
						if (scrolling && !chrome.runtime.lastError) {
							autoScrollStop();
						} else {
							autoScrollGo(session.plugins["autoScroll"].speed);
						}
					});
				}
			}
		}
	}
}

function pauseAllTabsGo() {
	chrome.tabs.query({}, function(tabs) {
		if (chrome.runtime.lastError) {
			return;
		}
		for (var i = 0; i < tabs.length; i++) {
			chrome.scripting.executeScript(tabs[i].id, { file: "plugins/pauseAllTabs.js", allFrames: true }, function() {
				if (chrome.runtime.lastError) {
					return;
				}
			});
		}
	});
}

function autoScrollGo(speed) {
	chrome.scripting.executeScript(
		{
			code: "var speed = " + speed / 20 + ";",
			allFrames: true
		},
		function() {
			if (chrome.runtime.lastError) {
				return;
			}
			chrome.scripting.executeScript(
				{
					file: "plugins/autoScroll.js",
					allFrames: true
				},
				function() {
					if (chrome.runtime.lastError) {
						return;
					}
				}
			);
		}
	);
}

function autoScrollStop() {
	chrome.tabs.sendMessage(getCurrentTab().id, { q: "scrollStop" }, function(scrolling) {
		if (chrome.runtime.lastError) {
			return;
		}
	});
}

function syncLoad(key, callback) {
	chrome.storage.sync.get(key, function(data) {
		if (chrome.runtime.lastError) {
			callback(null);
			return;
		}
		if (isDefined(data[key])) {
			callback(data[key]);
		} else {
			callback(null);
		}
	});
}

function localLoad(key, callback) {
	chrome.storage.local.get(key, function(data) {
		if (chrome.runtime.lastError) {
			callback(null);
			return;
		}
		if (isDefined(data[key])) {
			callback(data[key]);
		} else {
			callback(null);
		}
	});
}

function getLocalBytesRemaining(callback) {
	chrome.storage.local.getBytesInUse(null, function(inUse) {
		if (chrome.runtime.lastError) {
			session.localStorageRemaining = 0;
			return;
		}
		var bytes = chrome.storage.local.QUOTA_BYTES - inUse;
		session.localStorageRemaining = bytes;
		if (typeof callback === "function") {
			callback();
		}
	});
}

function rand(min, max) {
	min = parseInt(min, 10);
	max = parseInt(max, 10);
	if (max < min) {
		var temp = max;
		max = min;
		min = temp;
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
