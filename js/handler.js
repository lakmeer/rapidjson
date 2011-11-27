var Handler = function (_interface) {

	var interface = _interface;

	// Input mode definitions
	var inputMode = {

		windows : {

			// Cursor Movement
			'left'              : { name : 'moveToParent',           args : [] },
			'right'             : { name : 'moveToFirstChild',       args : [] },
			'up'                : { name : 'moveToPrevAnything',     args : [] },
			'down'              : { name : 'moveToNextAnything',     args : [] },

			'ctrl-up'           : { name : 'moveToPrevSibling',      args : [] },
			'ctrl-down'         : { name : 'moveToNextSibling',      args : [] },
			'ctrl-left'         : { name : 'moveToOldestAncestor',   args : [] },
			'ctrl-right'        : { name : 'moveToNewestDescendant', args : [] },

			'ctrl-shift-left'	: { name : 'moveToRoot',			 args : [] },

			'pgup'              : { name : 'moveToFirstInList',      args : [] },
			'pgdn'              : { name : 'moveToLastInList',       args : [] },
			'home'              : { name : 'moveToFirstSibling',     args : [] },
			'end'               : { name : 'moveToLastSibling',      args : [] },

			'1'                 : { name : 'moveToNthSibling',       args : [1] },
			'2'                 : { name : 'moveToNthSibling',       args : [2] },
			'3'                 : { name : 'moveToNthSibling',       args : [3] },
			'4'                 : { name : 'moveToNthSibling',       args : [4] },
			'5'                 : { name : 'moveToNthSibling',       args : [5] },
			'6'                 : { name : 'moveToNthSibling',       args : [6] },
			'7'                 : { name : 'moveToNthSibling',       args : [7] },
			'8'                 : { name : 'moveToNthSibling',       args : [8] },
			'9'                 : { name : 'moveToNthSibling',       args : [9] },

			'shift-1'           : { name : 'moveToNthChild',         args : [1] },
			'shift-2'           : { name : 'moveToNthChild',         args : [2] },
			'shift-3'           : { name : 'moveToNthChild',         args : [3] },
			'shift-4'           : { name : 'moveToNthChild',         args : [4] },
			'shift-5'           : { name : 'moveToNthChild',         args : [5] },
			'shift-6'           : { name : 'moveToNthChild',         args : [6] },
			'shift-7'           : { name : 'moveToNthChild',         args : [7] },
			'shift-8'           : { name : 'moveToNthChild',         args : [8] },
			'shift-9'           : { name : 'moveToNthChild',         args : [9] },

			'ctrl-1'            : { name : 'moveToNthGeneration',    args : [1] },
			'ctrl-2'            : { name : 'moveToNthGeneration',    args : [2] },
			'ctrl-3'            : { name : 'moveToNthGeneration',    args : [3] },
			'ctrl-4'            : { name : 'moveToNthGeneration',    args : [4] },
			'ctrl-5'            : { name : 'moveToNthGeneration',    args : [5] },
			'ctrl-6'            : { name : 'moveToNthGeneration',    args : [6] },
			'ctrl-7'            : { name : 'moveToNthGeneration',    args : [7] },
			'ctrl-8'            : { name : 'moveToNthGeneration',    args : [8] },
			'ctrl-9'            : { name : 'moveToNthGeneration',    args : [9] },

			// Folding
			'space'             : { name : 'foldThis',               args : [] },
			'ctrl-space'        : { name : 'foldAll',                args : [] },

			// Editing
			'return'            : { name : 'editValue',              args : [] },
			'tab'               : { name : 'editName',               args : [] },
			'shift-tab'         : { name : 'editPrevField',          args : [] },

			// Special Editing
			'kp_add'            : { name : 'editIncrement',          args : [  1 ] },
			'kp_subtract'       : { name : 'editDecrement',          args : [  1 ] },
			'shift-kp_add'      : { name : 'editIncrement',          args : [ 10 ] },
			'shift-kp_subtract' : { name : 'editDecrement',          args : [ 10 ] },

			'shift-tilde'       : { name : 'editTypeToggle', 		 args  : [] },

			// Copy & Paste
			'ctrl-X'            : { name : 'cutThis',                args : [] },
			'ctrl-C'            : { name : 'copyThis',               args : [] },
			'ctrl-V'            : { name : 'pasteIntoThis',          args : [] },

			// Nodes
			'shift-return'      : { name : 'insertSiblingAfter',     args : [] },
			'insert'            : { name : 'insertSiblingBefore',    args : [] },

			'ctrl-return'       : { name : 'insertChildAt',    		 args : [0] },
			'ctrl-shift-return' : { name : 'insertChildLast',        args : [] },

			'delete'            : { name : 'deleteThis',             args : [] },
			'ctrl-delete'       : { name : 'deleteAllChildren',      args : [] },
			'ctrl-shift-delete' : { name : 'deleteAllSiblings',      args : [] },
			'backspace'         : { name : 'deleteBeforeThis',       args : [] },

			// Ordering
			'ctrl-shift-up'     : { name : 'swapWithPrev',           args : [] },
			'crtl-shift-down'   : { name : 'swapWithNext',           args : [] },

			/* Type Conversion
			''                  : { name : 'forceTypeString',        args : [] },
			''                  : { name : 'forceTypeNumber',        args : [] },
			''                  : { name : 'forceTypeObject',        args : [] },
			''                  : { name : 'forceTypeArray',         args : [] },
			''                  : { name : 'forceTypeBoolean',       args : [] },
			''                  : { name : 'forceTypeNull',          args : [] },
			''                  : { name : 'editTypeBake',           args : [] },
			''                  : { name : 'editTypeToggle',         args : [] },
			''                  : { name : 'editIncrementValue',     args : [] },
			''                  : { name : 'editDecrementValue',     args : [] }, 			*/

			// File operations
			'ctrl-S'            : { app : 'save',      				 args : [] },
			'ctrl-N'			: { app : 'new',					 args : [] },
			'ctrl-O'			: { app : 'paste',					 args : [] },

			'ctrl-K'			: { app : 'info',		args : [ "hotkeys" ]   },
			'ctrl-D'			: { app : 'info',		args : [ "devmap" ]    },
			'ctrl-H'			: { app : 'info',		args : [ "help" ]  	   },

			// Debug output
			'ctrl-P'			: { name : 'debugPrintCurrent',      args : [] },

			// Search & Replace
			'slash'				: { app : 'newSearch',				 args : [] },
			'N'					: { app : 'nextSearch',			 	 args : [] }

		}

	};


	/*
	 * Class Properties
	 *
	 */

	var keyMap = {};


	/*
	 * Set input mode
	 *
	 */

	this.setInputMode = function setInputMode (_newMode) {

		// If we don't have this input mode, complain
		if (typeof inputMode[_newMode] === 'undefined') {

			App.console.error("Handler.setInputMode: Unknown input mode '" + _newMode + "'.");
			return;

		}

		keyMap = inputMode[_newMode];

		// console.log("Input Mode set -> '" + _newMode + "'");

	}


	/*
	 * Get command from keystroke
	 *
	 */

	function interpretKey (_keyName) {

		// Look up keystrokes
		var cmd = keyMap[_keyName],
			blank = { name : "noCommand", args : [] };

		// If command isn't mapped, return blank command
		if (typeof cmd === 'undefined') { return blank; }

		// If command is app-centric, perform the function then return blank command;
		if (cmd.app) { 

			App.file[cmd.app].apply(App, cmd.args);

			return blank;

		}
			
		return cmd;

	}





	/*
	 * Initialise
	 *
	 */

	// Set default input mode
	this.setInputMode('windows');

	this.interpretKey = interpretKey;
	

}

