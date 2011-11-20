/*
 * DOM Console
 *
 * A console in your DOM, son.
 *
 */

var Console = function (_console, _cmd) {

	// Properties
	var $console	= $(_console),
		$input		= $console.find("input"),
		history		= [];

	var flashTimer = 0;

	function flash (_msg, _color, _duration) {

		// Clear old timeout
		clearInterval(flashTimer);

		// Activate view
		$console.addClass(_color);
		$input.val(_msg); 

		// Sett timeout to deactivate
		flashTimer = setTimeout(clear, _duration);

	}


	// Get user input
	function input (_seed) {

		if (_seed) { $input.val(_seed); }

		$input.focus();

	}

	// Execute current contents
	function exe (_string) {

		if (!_string) { _string = $input.val(); }

		console.log("Execute function:", _string);

		// Interpret function here

		clear();

	}


	// Clear console state (turn off)
	function clear () {

		$input.val('').blur();
		$console.removeClass('red blue green');

		App.keyboard.resume();

	}

	//
	// LISTENERS
	//

	$input.bindKey(27, clear);

	$input.focus(function () {

		App.keyboard.pause();

		$console.addClass('blue');

		$input.bindKey(13, function () { exe($input.text()); }, true);

	});

	return {
		
		flash : flash,
		read  : input

	}

}
