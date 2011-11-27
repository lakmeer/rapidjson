function Keyboard (_eventHook) {

	var	self	= this,
		ignore	= false;

	var registerKey = _eventHook;

	// Names of keys we want to monitor
	this.decode = {
		"8"		: "backspace",
		"9"		: "tab",
		"13"	: "return",

		"19"	: "break",
		"20"	: "capslock",

		"32"	: "space",

		"33"	: "pgup",
		"34"	: "pgdn",
		"35"	: "end",
		"36"	: "home",

		"37"	: "left",
		"38"	: "up",
		"39"	: "right",
		"40"	: "down",

		"45"	: "insert",
		"46"	: "delete",

		"106"	: "kp_multiply",
		"107"	: "kp_add",
		"109"	: "kp_subtract",
		"110"	: "kp_period",
		"111"	: "kp_divide",

		"144"	: "numlock",
		"145"	: "scrolllock",

		"186"	: "semicolon",
		"187"	: "equals",
		"188"	: "comma",
		"189"	: "minus",
		"190"	: "period",
		"191"	: "slash",
		"192"	: "tilde",

		"219"	: "bracketleft",
		"221"	: "bracketright",
		"220"	: "backslash",
		"222"	: "quote"

	};

	// Fill in alpha keys in decoder
	for (var a = 65; a < 91; a++)  { this.decode[String(a)] = String.fromCharCode(a); }

	// Fill in numeric keys in decoder
	for (var b = 48; b < 58; b++)  { this.decode[String(b)] = String.fromCharCode(b); }

	// Fill in Numpad keys in decoder
	for (var c = 96; c < 106; c++) { this.decode[String(c)] = "KP_" + (c - 96); }

	// TODO: F-keys if appropriate, interferes with browser however
	// for (f-keys) {} 



	/*
	 * Stop listening for keystrokes
	 *
	 */

	this.pause = function KeyboardPause () {

		ignore = true;

	}



	/*
	 * Listen for keystrokes
	 *
	 */

	this.resume = function KeyboardResume () {

		ignore = false;

	}



	/*
	 * Handle input
	 *
	 */

	document.addEventListener("keydown", function handleKeydown (_key) {

		if (ignore) { return _key; }

		var k = _key.keyCode;

		// If this key isn't mapped, let it go 
		if (typeof self.decode[k] === 'undefined') { return _key; }

		// Create modifier key string
		var modifiedCode = (( _key.ctrlKey  ) ? "ctrl-"  : "") + (( _key.altKey   ) ? "alt-"   : "") + (( _key.shiftKey ) ? "shift-" : ""); //	(( _key.metaKey  ) ? "meta-"  : ""), 
				   
		// Build lookup string
		var keyName = modifiedCode + self.decode[k];

		// If key is mapped, but no command assigned to it, let it go
		if (keyName === "noCommand") { return _key; }

		// Else bind command name to new 'keyboard' event
		//var command = document.createEvent("Event");
		//	command.initEvent("keyboard", true, true);
		//	command.keys = keyName;
		// document.dispatchEvent(command);

		registerKey(keyName);

		// Eat the eventt
		_key.preventDefault();
		return false;
	
	}, true);

};

