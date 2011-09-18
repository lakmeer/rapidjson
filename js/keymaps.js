function KB () {

	var self = this,
		keyMap = {},
		ignore = false;

	// MAp keycodes to named keys
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

	},

	// Map key names to commands based on input method

	this.inputMode = {

		windows : {

			// Cursor Movement
			'left'				:	'moveToParent',
			'right'				:	'moveToFirstChild',
			'up'				:	'moveToPrevAnything',
			'down'				:	'moveToNextAnything',

			'pgup'				:	'moveToFirstPrimary',
			'pgdn'				:	'moveToLastPrimary',
			'home'				:	'moveToFirstSibling',
			'end'				:	'moveToLastSibling',

			'1'					:	'moveToNthChild1',
			'2'					:	'moveToNthChild2',
			'3'					:	'moveToNthChild3',
			'4'					:	'moveToNthChild4',
			'5'					:	'moveToNthChild5',
			'6'					:	'moveToNthChild6',
			'7'					:	'moveToNthChild7',
			'8'					:	'moveToNthChild8',
			'9'					:	'moveToNthChild9',
			'ctrl-1'			:	'moveToNthGeneration1',
			'ctrl-2'			:	'moveToNthGeneration2',
			'ctrl-3'			:	'moveToNthGeneration3',
			'ctrl-4'			:	'moveToNthGeneration4',
			'ctrl-5'			:	'moveToNthGeneration5',
			'ctrl-6'			:	'moveToNthGeneration6',
			'ctrl-7'			:	'moveToNthGeneration7',
			'ctrl-8'			:	'moveToNthGeneration8',
			'ctrl-9'			:	'moveToNthGeneration9',

			// Folding
			'space'				:	'foldThis',
			'ctrl-space'		:	'foldAll',

			// Editing
			'return'			:	'editValue',
			'tab'				:	'editNextField',
			'shift-tab'			:	'editPrevField',

			// Nodes
			'shift-return'		:	'insertSiblingAfter',
			'insert'			:	'insertSiblingBefore',

			/* Temp */
			'shift-N'			:	'insertChildHere',
			/*      */

			'ctrl-return'		:	'insertChildHere',
			'crtl-shift-return'	:	'insertChildLast',
			'delete'			:	'deleteThis',
			'ctrl-delete'		:	'deleteAllChildren',
			'ctrl-shift-delete'	:	'deleteAllSiblings',
			'backspace'			:	'deleteBeforeThis',

			// Ordering
			'ctrl-shift-up'		:	'swapWithPrev',
			'crtl-shift-down'	:	'swapWithNext',

			/* Type Conversion 
			''					:	'editTypeForceString',
			''					:	'editTypeForceNumber',
			''					:	'editTypeForceObject',
			''					:	'editTypeForceArray',
			''					:	'editTypeForceBoolean',
			''					:	'editTypeForceNull',
			''					:	'editTypeBake',
			''					:	'editTypeToggle',
			''					:	'editIncrementValue',
			''					:	'editDecrementValue', 			*/

			// File operations
			'ctrl-S'			:	'saveFile',
			// Undefined
			'undefined'			:	'undefinedCommand'
		}

	};

	// Fill in alpha keys in decoder
	for (var a = 65; a < 91; a++)  { this.decode[String(a)] = String.fromCharCode(a); }

	// Fill in numeric keys in decoder
	for (var b = 48; b < 58; b++)  { this.decode[String(b)] = String.fromCharCode(b); }

	// Fill in Numpad keys in decoder
	for (var c = 92; c < 105; c++) { this.decode[String(c)] = "KP_" + String.fromCharCode(c); }


	/*
	 * Set input mode
	 *
	 */

	this.setInputMode = function setInputMode (_newMode) {

		// If we don't have this input mode, complain
		if (typeof self.inputMode[_newMode] === 'undefined') {

			alert("Unknown input mode '" + _newMode + "'.");
			return;

		}

		keyMap = self.inputMode[_newMode];

		trace.both("Input Mode set -> '" + _newMode + "'");

	}


	/*
	 * Get command from keystroke
	 *
	 */

	function interpretKey (_keyName) {

		return keyMap[_keyName] || "noCommand";

	}


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

	document.addEventListener("keydown", function (_key) {
	
		if (ignore) { return _key; }

		var k = _key.keyCode;

		// If this key isn't mapped, let it go 
		if (typeof self.decode[k] === 'undefined') { return _key; }

		// Create modifier key string
		var modifiedCode = (( _key.ctrlKey  ) ? "ctrl-"  : "") + (( _key.altKey   ) ? "alt-"   : "") + (( _key.shiftKey ) ? "shift-" : ""); //	(( _key.metaKey  ) ? "meta-"  : ""), 
				   
		// Build lookup string
		var commandName = interpretKey(modifiedCode + self.decode[k]);

		// If key is mapped, but no command assigned to it, let it go
		if (commandName === "noCommand") { return _key; }

		// Else bind command name to new 'command' event
		var command = document.createEvent("Event");
			command.initEvent("command", true, true);
			command.cmd = commandName;

		// Fire
		document.dispatchEvent(command);

		// Eat the eventt
		_key.preventDefault();
		return false;
	
	}, true);

	// Set default input mode
	this.setInputMode('windows');

};

var Keyboard = new KB();


