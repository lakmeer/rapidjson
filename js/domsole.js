/*
 * DOM Console
 *
 * A console in your DOM, son.
 *
 */

var DomConsole = function (_console, _cmd) {

	// Properties
	$console	= $(_console),
	maxLines	= 20;

	// Addnew line to console, with extra class for error level styling
	function newLine (_msg, _classlist) {

		var classes = _classlist || "",
			$newLine = $("<p class='" + classes + " new'>" + _msg + "</p>"); 

		$console.prepend($newLine);

		cullOldLines();

		setTimeout(function () { $newLine.removeClass('new'); }, 10);

	}

	// Change max number of lines from defaul (8)
	function setExpiry (_max) {

		maxLines = _max;

	}

	// For each line, kill the oldest one : i > maxLines
	function cullOldLines () {

		if ($console.children().length > maxLines) {

			$console.children().last().remove();

		}

	}

	// Clear whole console
	function clearAll () {

		$console.children().remove();

	}

	// Create command in global context
	if (window[_cmd]) {

		alert("Cannot create command '" + _cmd + "' for this DomConsole, it is already taken.");
		return;

	} else {
	 
		window[_cmd] = {

			log		: function (_msg) { newLine(_msg); },

			error	: function (_msg) { newLine(_msg, 'error'); },

			clear	: clearAll,

			setMax	: setExpiry,

			both	: function (_msg) { newLine(_msg); console.log(_msg); }

		}

	}

	window[_cmd].log("Console activated.");

}('#console', 'trace');


