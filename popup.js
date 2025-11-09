/* globals chrome, $ */

var currentTab = {};

$(document).ready(function() {

	loadDefaults();

	$("#autoClickStart").click(function() {
		//console.log("Caught autoclicker click ", currentTab);
		if ($(this).text() == "Select Click Target") {
			var delay = 10;
			// Parse Delay from input field, if changed
			if (!isNaN(parseFloat($("#autoClickDelay").val()))) {
				delay = parseFloat($("#autoClickDelay").val());
				if (delay < 0) {
					delay = 0;
					$("#autoClickDelay").val(delay);
				}
			} else {
				$("#autoClickDelay").val(delay);
			}
			// Save delay value for access by autoclicker code
			chrome.storage.local.set({ autoClickDelay: delay }, function() {
				if (chrome.runtime.lastError) return;
			});

			chrome.scripting.executeScript(
				{
					files: ["jquery-3.7.1.min.js"],
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

			chrome.scripting.executeScript(
				{
					files: ["plugins/autoClick.js"],
					target: { tabId: currentTab.id }
				}
			);
			if (chrome.runtime.lastError) return;
			window.close();

			$("#autoClickStart").text("Stop");
		} else {
			chrome.tabs.sendMessage(currentTab.id, { stopClicking : true });
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
		//console.log("Setting delay to", delay);
		chrome.storage.local.set({ autoClickDelay: delay }, function() {
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
		//console.log("Loading defaults");

		currentTab = await chrome.runtime.sendMessage({ getCurrentTab : true });
		//console.log("Got tab: ", currentTab);
		
		chrome.tabs.sendMessage(currentTab.id, { isClicking: true },
			function(response) {
				//console.log("clicking response:", response);
				if (chrome.runtime.lastError) 
					return;
				if (response) 
					$("#autoClickStart").text("Stop");
			}
		);

		await chrome.storage.local.get( "autoClickDelay", function(data) {
			if (chrome.runtime.lastError) return;
			if(isDefined(data["autoClickDelay"])) {
				delay = data["autoClickDelay"];
				$("#autoClickDelay").val(data["autoClickDelay"]);
				//console.log("Setting delay", data["autoClickDelay"]);
			}
		});
	}
});
