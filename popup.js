/* globals chrome, $ */

var currentTab = {};
loadCurrentTab();
chrome.tabs.onUpdated.addListener(onUpdateTab);
chrome.tabs.onRemoved.addListener(onRemoveTab);
chrome.tabs.onActivated.addListener(onActivatedTab);
chrome.windows.onFocusChanged.addListener(onWindowFocus);

function loadCurrentTab() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(results) {
		if (results.length > 0) {
			currentTab = results[0];
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

$(document).ready(function() {

	loadDefaults();

	$("#autoClickStart").click(function() {
		//var currentTab = await chrome.runtime.sendMessage({ getCurrentTab : true });
		console.log("Caught autoclicker click ", currentTab);
		if ($(this).text() == "Select Click Target") {
			var delay = 10;
			if (!isNaN(parseFloat($("#autoClickDelay").val()))) {
				delay = parseFloat($("#autoClickDelay").val());
				if (delay < 0) {
					delay = 0;
					$("#autoClickDelay").val(delay);
				}
			} else $("#autoClickDelay").val(delay);

			chrome.scripting.executeScript(
				{
					files: ["jquery-3.1.1.min.js"],
					target: { tabId: currentTab.id }
				}
			);
			if (chrome.runtime.lastError) return;

			chrome.scripting.executeScript(
				{
					files: ["scripts/domSelector.js"],
					target: { tabId: currentTab.id }
				}
			);
			if (chrome.runtime.lastError) return;

			//chrome.runtime.sendMessage({ setAutoClickDelay : delay });
			// chrome.scripting.executeScript(
			// 	{
			// 		func: (delay) => { "delay = " + delay + "; console.log(delay);" },
			// 		target: { tabId: currentTab.id }
			// 	}
			// );
			if (chrome.runtime.lastError) return;

			chrome.scripting.executeScript(
				{
					files: ["plugins/autoClick.js"],
					target: { tabId: currentTab.id }
				}
			);
			if (chrome.runtime.lastError) return;
			window.close();

			$("#autoClickStart").text("Stop");
			//chrome.runtime.sendMessage({ setAutoClickDelay : delay });
			chrome.storage.sync.set({ autoClickDelay: delay }, function() {
				if (chrome.runtime.lastError) return;
			});
		} else {
			//chrome.runtime.sendMessage({ stopClicking : true });
			chrome.storage.sync.set({ autoClickActive: false });
			// chrome.scripting.executeScript(
			// 	{
			// 		func: () => { "clicking = false; if (domSelector){ domSelector.stop(); }" },
			// 		target: { tabId: currentTab.id }
			// 	}
			// );
			if (chrome.runtime.lastError) return;
			$("#autoClickStart").text("Select Click Target");
		}
	});

	$("#autoClickDelay").change(async function(val) {
		var delay = 10;
		if (!isNaN(parseFloat($("#autoClickDelay").val()))) {
			delay = parseFloat($("#autoClickDelay").val());
			if (delay < 0) {
				delay = 0;
			}
		}
		//await chrome.runtime.sendMessage({ setAutoClickDelay : delay });
		console.log("Setting delay to", delay);
		chrome.storage.sync.set({ autoClickDelay: delay }, function() {
			if (chrome.runtime.lastError) return;
		});
	});

	$("#optionsPage").click(function() {
		if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
		else
			window.open(chrome.runtime.getURL("options.html"), function() {
				if (chrome.runtime.lastError) return;
			});
	});

	async function loadDefaults() {
		console.log("Loading defaults");

		//currentTab = chrome.runtime.sendMessage({ getCurrentTab : true });
		//console.log("Got tab: ", currentTab);
		
		chrome.storage.sync.get( "autoClickActive", function(data) {
			if(isDefined(data["autoClickActive"])) {
				if (data["autoClickActive"]) {
					$("#autoClickStart").text("Stop");
				}
			}
		});

		// chrome.tabs.sendMessage(currentTab.id, { isClicking: true },
		// 	function(response) {
		// 		console.log("clicking response:", response);
		// 		if (chrome.runtime.lastError) 
		// 			return;
		// 		if (response) 
		// 			$("#autoClickStart").text("Stop");
		// 	}
		// );

		//var autoClickSettings = chrome.runtime.sendMessage({ getPluginInfo : {name: "autoClick"}});
		//console.log("Got plugin info: ", autoClickSettings);
		await chrome.storage.sync.get( "autoClickDelay", function(data) {
			if (chrome.runtime.lastError) return;
			if(isDefined(data["autoClickDelay"])) {
				delay = data["autoClickDelay"];
				$("#autoClickDelay").val(data["autoClickDelay"]);
				console.log("Got delay", data["autoClickDelay"]);
			}
		});
		//$("#autoClickDelay").val(delay);
	}
});
