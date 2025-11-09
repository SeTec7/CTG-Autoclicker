/* globals */

$(function() {
	// var currentPage = "";
	// var shortcutKeys = ["", "A", "B", "C", "G", "H", "I", "J", "K", "L", "M", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

	// setup();
	// loadOptions();

	// $(".enablePluginCheckbox").change(function() {
	// 	showSaveNotification();
	// 	saveSetting(this);
	// 	if (this.id == "revealPasswordEnabled") {
	// 		scripts.setRevealPassword(this.checked);
	// 	}
	// });

	// function saveSetting(option) {
	// 	if (option.id == "hideUnavailable") {
	// 		background.settings.hideUnavailable = option.checked;
	// 		syncSave("hideUnavailable", option.checked);
	// 	} else {
	// 		var name = option.id.replace("Enabled", "");
	// 		background.plugins[name].enabled = option.checked;
	// 		syncSave(name + "Enabled", option.checked);
	// 	}
	// }

	// $("#customPluginCreate").click(function() {
	// 	window.location.href = "plugins/customplugins.html";
	// });

	// async function loadOptions() {
	// 	var plugins = await chrome.runtime.sendMessage({ getPluginInfo : true });
	// 	var pluginKeys = Object.keys(plugins);
	// 	for (var i = 0; i < pluginKeys.length; i++) {
	// 		if (!plugins[pluginKeys[i]].enabled) {
	// 			$("#" + pluginKeys[i] + "Enabled").prop("checked", false);
	// 		}
	// 		if (isDefined(plugins[pluginKeys[i]].shortcut) && plugins[pluginKeys[i]].shortcut.length == 1) {
	// 			$("#" + pluginKeys[i] + "ShortcutEnabled").prop("checked", true);
	// 			$("#" + pluginKeys[i] + "ShortcutDisplay").attr("hidden", false);
	// 			$("#" + pluginKeys[i] + "Shortcut").val(plugins[pluginKeys[i]].shortcut);
	// 			disableSelectedShortcutKey(pluginKeys[i], plugins[pluginKeys[i]].shortcut);
	// 		}
	// 	}

	// 	var hideUnavailable = await chrome.runtime.sendMessage({ getHideUnavailableSetting : true });
	// 	if (!hideUnavailable) {
	// 		$("#hideUnavailable").prop("checked", false);
	// 	}

	// 	$("#version").text("v" + chrome.runtime.getManifest().version);

	// 	var installReason = await chrome.runtime.sendMessage({ getInstallReason : true })
	// 	if (installReason == "install") {
	// 		$("#installReasonInstall").attr("hidden", false);
	// 		chrome.runtime.sendMessage({ setInstallReason : null });
	// 	}
	// }

	// function syncSave(key, val) {
	// 	var obj = {};
	// 	obj[key] = val;
	// 	chrome.storage.sync.set(obj, function() {
	// 		if (chrome.runtime.lastError) {
	// 			return;
	// 		}
	// 	});
	// }

	// function setup() {
	// 	var shortcutSelect = document.getElementsByClassName("shortcutSelect");
	// 	for (var i = 0; i < z.length; i++) {
	// 		for (var k = 0; k < shortcutSelect.length; k++) {
	// 			var option = document.createElement("option");
	// 			option.text = shortcutKeys[i];
	// 			option.value = shortcutKeys[i];
	// 			shortcutSelect[k].add(option);
	// 		}
	// 	}

	// 	detectPageChange();
	// 	$(".tabChange").click(function() {
	// 		setTimeout(detectPageChange, 10);
	// 	});
	// 	setInterval(detectPageChange, 250);
	// }

	// function detectPageChange() {
	// 	var page = window.location.href.substr(window.location.href.lastIndexOf("#") + 1);
	// 	if (page != currentPage) {
	// 		currentPage = page;
	// 		if (document.getElementById(currentPage) == null) {
	// 			currentPage = "EnableDisablePlugins";
	// 			window.location.href = "#" + currentPage;
	// 		}
	// 		changePage();
	// 	}
	// }

	// function changePage() {
	// 	$(".pageDiv").css("display", "none");
	// 	$("#" + currentPage).css("display", "");
	// 	for (var i = 0; i < $(".tabs").length; i++) {
	// 		if ($(".tabs")[i].href.indexOf(currentPage) != -1) {
	// 			$(".tabs")[i].className = "tabs selectedTab";
	// 		} else {
	// 			$(".tabs")[i].className = "tabs";
	// 		}
	// 	}
	// }

	// $(".enableShortcutCheckbox").click(function() {
	// 	var plugin = this.id.replace("ShortcutEnabled", "");
	// 	$("#" + plugin + "ShortcutDisplay").attr("hidden", !this.checked);
	// 	if (!this.checked) {
	// 		enableSelectedShortcutKey(background.plugins[plugin].shortcut);
	// 		$("#" + plugin + "Shortcut").val("");
	// 		background.plugins[plugin].shortcut = "";
	// 		syncSave(plugin + "Shortcut", "");
	// 		showSaveNotification();
	// 	}
	// });

	// $(".shortcutSelect").change(function() {
	// 	var plugin = this.id.replace("Shortcut", "");
	// 	var selectedLetter = this.value;
	// 	syncSave(plugin + "Shortcut", selectedLetter);
	// 	if (background.plugins[plugin].shortcut.length == 1) {
	// 		enableSelectedShortcutKey(background.plugins[plugin].shortcut);
	// 	}
	// 	background.plugins[plugin].shortcut = selectedLetter;
	// 	disableSelectedShortcutKey(plugin, selectedLetter);
	// 	showSaveNotification();
	// });

	// function enableSelectedShortcutKey(selectedLetter) {
	// 	var shortcutSelect = document.getElementsByClassName("shortcutSelect");
	// 	for (var i = 0; i < shortcutSelect.length; i++) {
	// 		var options = shortcutSelect[i].getElementsByTagName("option");
	// 		for (var k = 0; k < options.length; k++) {
	// 			if (options[k].value == selectedLetter) {
	// 				options[k].disabled = false;
	// 				break;
	// 			}
	// 		}
	// 	}
	// }

	// function disableSelectedShortcutKey(plugin, selectedLetter) {
	// 	var shortcutSelect = document.getElementsByClassName("shortcutSelect");
	// 	for (var i = 0; i < shortcutSelect.length; i++) {
	// 		if (shortcutSelect[i].id.indexOf(plugin) == -1) {
	// 			var options = shortcutSelect[i].getElementsByTagName("option");
	// 			for (var k = 0; k < options.length; k++) {
	// 				if (options[k].value == selectedLetter) {
	// 					options[k].disabled = true;
	// 					break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// function showSaveNotification() {
	// 	$("#saveLine").prop("hidden", false);
	// 	setTimeout(function() {
	// 		$("#saveLine").prop("hidden", true);
	// 	}, 2000);
	// }
});
