/*
 * Interface
 *
 * This is the communication point between the app proper and the Cursor, which in turn gives 
 * access to the Node tree. This file knows how to perform all the various operations requested 
 * by the user. The App frontend only knows how to receive the commands and send them here.
 *
 * Hopefully this flow will be one-way, trickling all the way down to the node tree whose nodes
 * are each responsible for updating thier own views of themselveslves. It may or may not work out 
 * this way.
 *
 */


/*
 * Interface Class Constructor
 *
 * All of these methods are private, designed to be called by event trigger
 *
 * cursor : takes reference to a cursor controller
 *
 */

var Interface = function (cursor) {


	/*
	 * Cut-and-paste memory
	 *
	 * Memory handler takes nodes, but only stores JSON strings. It automatically
	 * converts them back to nodes when fetched again.
	 *
	 * TODO: Extend this to collections whenever they show up
	 *
	 */

	// Tiny singleton to abstract the 'anonymous register' concept a bit
	var memory = (function () { 
		
		var register = {}

		// Generate registers...
		for (var i = 97; i < 123; i++) { register[String.fromCharCode(i)] = null; } // Named registers
		register._ = null;		// Anonymous register
		register.$ = null;		// Swap register

		// Setter
		this.set = function (_node, _r) {

			var r = _r || '_';

			register[r] = { name : _node.key, value : _node.raw() };

		};

		// Getter
		this.get = function (_r) {

			var r = _r || '_',
				x = register[r];

			return new Node(x.name, x.value);

		};

		// Get raw Json string for processing in another context
		this.getRaw = function (_r) {

			var r = _r || '_';

			return register[r].value();

		}

		// Empty a register
		this.clear = function (_r) {

			var r = _r || '_';

			register[r] = null;

		}

		return this;

	}());





	/*
	 * Command Bank - Command Metadata
	 *
	 * Includes data about the available commands, such
	 * as the accepted types of nodes and whether or not
	 * the operation requires recalculation of the cursor's
	 * flat list.
	 *
	 * Properties:
	 *
	 *	 arity		- maximum expected number of arguments
	 *	
	 *	 refresh	- whether or not to recalculate flat list
	 *	
	 *	 types		- list of accepted node types. Legal values are:
	 *	
	 *	
	 *		null, true, false, string, number, object, array
	 *		valueless	[null, true, false]
	 *		valued		[string, number]
	 *		primitive	[null, true, false, string, number]
	 *		nested		[object, array]
	 *	
	 *
	 */


	var commandBank = {

		// Movement
		"moveToNextAnything"		: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToPrevAnything"		: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToParent"				: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToFirstChild"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToLastChild"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToFirstSibling"		: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToLastSibling"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToNextSibling"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToPrevSibling"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToFirstInList"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToLastInList"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },
		"moveToNthGeneration"		: { 'types': [ 'all' ],					'refresh': false,		'arity': 1 },
		"moveToNthChild"			: { 'types': [ 'object', 'array' ],		'refresh': false,		'arity': 1 },
		"moveToNthSibling"			: { 'types': [ 'all' ],					'refresh': false,		'arity': 1 },
		"moveToOldestAncestor"		: { 'types': [ 'all' ], 				'refresh': false,		'arity': 0 },
		"moveToNewestDescendant"	: { 'types': [ 'object', 'array' ],		'refresh': false,		'arity': 0 },
		"moveToRoot"				: { 'types': [ 'all' ],					'refresh': false,		'arity': 0 },

		// Folding
		"foldThis"					: { 'types': [ 'array', 'object' ],		'refresh': false,		'arity': 0 },
		"foldAll"					: { 'types': [ 'array', 'object' ],		'refresh': false,		'arity': 0 },

		// Editing
		"editValue"					: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"editName"					: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		// Creating
		"insertSiblingFirst"		: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"insertSiblingBefore"		: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"insertSiblingAt"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 1 },
		"insertSiblingAfter"		: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"insertSiblingLast"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		"insertChildAt"				: { 'types': [ 'array', 'object' ],		'refresh': true,		'arity': 1 },
		"insertChildLast"			: { 'types': [ 'array', 'object' ],		'refresh': true,		'arity': 0 },

		// Destroying
		"deleteThis"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"deleteAllChildren"			: { 'types': [ 'array', 'object' ],		'refresh': true,		'arity': 0 },
		"deleteAllSiblings"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"deleteBeforeThis"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"deleteAfterThis"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		// Copypasting
		"cutThis"					: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"copyThis"					: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"pasteAsThis"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"pasteIntoThis"				: { 'types': [ 'array', 'object' ],		'refresh': true,		'arity': 0 },

		// Swapping
		"swapWithPrev"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"swapWithNext"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		// Type coersion
		"forceTypeString"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"forceTypeNumber"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"forceTypeObject"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"forceTypeArray"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"forceTypeBoolean"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"forceTypeNull"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		"editTypeBake"				: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },
		"editTypeToggle"			: { 'types': [ 'all' ],					'refresh': true,		'arity': 0 },

		// Special editing	
		"editIncrement"				: { 'types': [ 'number' ],				'refresh': true,		'arity': 1 },
		"editDecrement"				: { 'types': [ 'number' ],				'refresh': true,		'arity': 1 },

		// Debug commands
		"debugPrintCurrent"			: { 'types': [ 'all' ],                 'refresh': false,       'arity': 0 },

		// Default
		"noCommand"					: { 'types': [ 'all' ],					'refresh' : false,		'arity': 0 }

	};





	/*
	 * Command functions
	 *
	 * Now the actual command functions
	 *
	 * Set up as self executing cos I like 
	 * the 'this' way of declaring methods.
	 *
	 */

	//
	// MOVEMENT
	//

	var commandFunctions = {


			/*
			 * moveToNextAnything
			 *
			 */

			moveToNextAnything : function () {

				cursor.moveTo(cursor.getNext());

			},

			/*
			 * moveToPrevAnything
			 *
			 */

			moveToPrevAnything : function () {

				 cursor.moveTo(cursor.getPrev());

			},

			/*
			 * moveToParent
			 *
			 */

			moveToParent : function () {

				// If this is root, no parent exists
				if (this.isRoot) { return false; }

				cursor.moveTo(this.parent);

			},

			/*
			 * movetoFirstChild
			 *
			 */

			moveToFirstChild : function () {

				if (this.children.length > 0) {

					if (this.folded) { commandFunctions.foldThis.apply(this); }

					cursor.moveTo(this.children[0]);
					return true;

				}

				return false;

			},

		   /*
			* moveToLastChild
			*
			*/

			moveToLastChild : function () {

				if (this.children.length > 0) {

					if (this.folded) { commandFunctions.foldThis.apply(this); }

					cursor.moveTo(this.children[this.children.length - 1]);

					return true;
					
				}

				return false;

			},

			/*
			 * moveToNextSibling
			 *
			 */

			moveToNextSibling : function () {

				// If this is the last sibling, fail
				if (this.getIndex() >= this.parent.children.length - 1) {

					return false;

				// Otherwise, go to next sibling
				} else {

					cursor.moveTo(this.parent.children[this.getIndex() + 1]);
					return true;

				}

			},

			/*
			 * moveToPrevSibling
			 *
			 */

			moveToPrevSibling : function () {

				if (this.getIndex() === 0) {

					// loop: commandFunctions.moveToLastSibling.apply(this);
					return false;

				} else {

					cursor.moveTo(this.parent.children[this.getIndex() - 1]);
					return true;

				}
			},


			/*
			 * moveToFirstSibling
			 *
			 */

			moveToFirstSibling : function () {

				cursor.moveTo(this.parent.children[0]);
				return true;

			},


			/*
			 * moveToLastSibling
			 *
			 */

			moveToLastSibling : function () {

				cursor.moveTo(this.parent.children[this.parent.children.length - 1 ]);
				return true;

			},


			/*
			 * moveToFirstInList
			 *
			 * absolute first node
			 *
			 */

			moveToFirstInList : function () {

				cursor.moveTo(App.root.children[0]);

			},


			/*
			 * moveToLastInList
			 *
			 */

			moveToLastInList : function () {

			   cursor.moveTo(App.root.children[App.root.children.length - 1]);

			},


			/*
			 * moveToNthSibling
			 *
			 */

			moveToNthSibling : function (_n) {

				if (!this.siblings) { return false; }

				if (_n > this.siblings.length) { 
					
					App.console.error("I.moveToNthSibling: No sibling at position " + (_n)); 
					return; 
				
				}

				// Subtract one because 'first' node is actually zeroth in array
				cursor.moveTo(this.siblings[_n - 1]);

			},


			/*
			 * moveToNthGeneration
			 *
			 */

			moveToNthGeneration : function (_n) {

				var thisDepth = cursor.depth;

				if (thisDepth === _n) { return; }

				if (thisDepth > _n) {

					for (var i = 0; i < thisDepth - _n; i++) {

						commandFunctions.moveToParent.apply(this);

					}

				} else {

					for (var i = 0; i < _n - thisDepth; i++) {

						commandFunctions.moveToFirstChild.apply(this);

					}

				}

			},


			/*
			 * moveToNthChild
			 *
			 */

			moveToNthChild : function (_n) {

				if (_n > this.children.length) { return; }

				if (this.folded) { commandFunctions.foldThis.apply(this); }

				cursor.moveTo(this.children[_n - 1]);

			},



			/*
			 * moveToOldestAncestor
			 *
			 */


			moveToOldestAncestor : function () {

				function upOne (_this) {

					if (_this.parent.isRoot) { return _this; }
					return upOne(_this.parent);

				}

				var oldest = upOne(this);

				if (oldest === this) { return false; }

				cursor.moveTo(oldest);
				return true;

			},




			/*
			 * moveToNewestDescendant
			 *
			 */

			moveToNewestDescendant : function () {

				if (this.folded) { return false; }

				var deepest = this;

				this.recurse(function () {

					if (this.depth >= deepest.depth) { deepest = this; }

				});

				cursor.moveTo(deepest);
				return true;

			},




			/*
			 * moveToRoot
			 *
			 * TODO: This is a temp hack. Probably give it to Cursor
			 *
			 */

			moveToRoot : function () {

				function findRoot (_this) {

					if (_this.isRoot) { return _this; }
					return findRoot(_this.parent);

				}

				cursor.moveTo(findRoot(this));

				return true;

			},






			//
			// FOLDING
			//

			/*
			 * foldThis
			 *
			 */

			foldThis : function () {

				this.fold();

				cursor.refreshFolded();

				return true;

			},


			/*
			 * foldAll
			 *
			 */
			
			foldAll :  function (_which) {

				if (typeof _which === 'undefined') {

					_which = !(this.folded);

				}

				for (var i = 0; i < this.children.length; i++) {

					var thisChild = this.children[i];

					commandFunctions.foldAll.apply(thisChild, [ _which ]);

				}

				this.fold(_which);
	
				cursor.refreshFolded();

				return true;

			},


			//
			// EDIT DATA
			//


			/*
			 * editName
			 *
			 */

			editName : function () {

				var self = this;

				App.ui.showDialog({ 
					
					title      : 'Renaming "' + this.key + '":', 
					type       : 'text',
					fields	   : [
						{ name : "name", value : this.key }
					]
					
				}, function (_response) {
				
					self.setKey(_response[0]);

					cursor.refreshList();
						
				});

			},


			/*
			 * editValue
			 *
			 */

			editValue : function () {

				var self = this;

				App.ui.showDialog({ 

					title      : 'Modifying "' + this.key + '":',
					type       : 'text',
					fields	   : [
						{ name : "name", value : JSON.stringify(this.raw()) }
					]

				}, function (_response) {

					self.setValue(sanitise(_response[0]));

					cursor.refreshList();

				});

			},




			//
			// CREATE NEW NODES
			//
			// Insertion methods should set up to edit the new
			// blank node immediately. Edit mode can probably 
			// be triggered with callbacks.
			//
			//

			insertSiblingAt : function (_position) {

				var pos = (typeof _position === 'undefined') ? 0 : _position;

				commandFunctions.insertChildAt

			},

			insertSiblingAfter : function () {

				// Adopt - true = manual sibling placement
				this.parent.adopt(_newNode, true);

				// Get index number of this element
				var currentIx = this.parent.children.indexOf(this);

				// Insert child after this point
				this.parent.children.splice(currentIx + 1, 0, _newNode);

			},

			insertSiblingBefore : function () {

				// Adopt - true = manual sibling placement
				this.parent.adopt(_newNode, true);

				// Get index number of this element
				var currentIx = this.parent.children.indexOf(this);

				// Insert child at (before) this point
				this.parent.children.splice(currentIx, 0, _newNode);

			},



			/*
			 * insertChildAt	-	generate new node, insert at specified position
			 *
			 * _position:	zero-indexed position to insert new node
			 *
			 */

			insertChildAt : function (_position) {

				var self 		= this,
					pos			= (typeof _position === 'undefined') ? 0 : _position,
					inputFields	= [
						{ name : 'key', value : 'Name...' },
						{ name : 'val', value : 'Value...' }
					];

				// If parent is an array, we don't need to ask for key
				if (this.type === 'array') {

					inputFields = [ { name : 'val', value : 'Value...' } ];

				}

				App.ui.showDialog({ 
					
					title  : "New Node:",
				   	type   : 'text',
					fields : inputFields
				
				}, function (_array) {

					var key	  = _array[0],
						value = _array[1];

					// If array, we only got one value back as 'key' so remap them
					if (self.type === 'array') {

						value = key;
						key   = "auto_number";

					}

					// Sanitise value input
					value = sanitise(value);

					// New node
					var newNode = new Node(key, value);

					// Adopt
					self.adoptAt(pos, newNode);

					// Requires 'late' list refresh as main command function has already returned
					cursor.refreshList();

				});

				// Adopt - true = manual sibling placement
				// this.adopt(_newNode, true);

				// Insert child at zeroth position
				// this.children.splice(0, 0, _newNode);
				
				// this.children.unshift(1, newNode);

			},

			insertChildLast : function (_newNode) {

				commandFunctions.insertChildAt.apply(this, [ this.children.length ]);

				return true;				

			},



			//
			// DESTROY nodes
			//

			deleteThis : function () {

				// If this is an only child, go to parent.
				if (this.parent.children.length === 1) {

					cursor.moveTo(this.parent);

				// If this is the last sibling, go backwards if possible
				} else if (this.getIndex() >= this.siblings.length - 1) {

					commandFunctions.moveToPrevSibling.apply(this);

				// Otherwise, go to next sibling
				} else {

					cursor.moveTo(this.siblings[this.getIndex() + 1]);

				}

				this.kill();

			},

			deleteAllChildren : function () {

				this.killAllChildren();

			},

			/*
			 * deleteAllSiblings
			 *
			 */

			deleteAllSiblings : function () {

				commandFunctions.deleteBeforeThis.apply(this);
				commandFunctions.deleteAfterThis.apply(this);

			},

			/*
			 * deleteBeforeThis
			 *
			 */

			deleteBeforeThis : function () {

				// If only child, return
				if (this.parent.children.length < 2) { return; }

				// For zero to here times, delete item 0;
				for (var i = 0, max = this.getIndex(); i < max; i++) {

					commandFunctions.deleteThis.apply(this.parent.children[0]);

				}

			},

			/*
			 * deleteAfterThis
			 *
			 */

			deleteAfterThis : function () {

				// If only child, return
				if (this.parent.children.length < 2) { return; }

				// Until this is the last child, delete last child
				while (this.getIndex() < this.parent.children.length - 1) {

					commandFunctions.deleteThis.apply(this.parent.children[this.getIndex() + 1]);

				}
				
				cursor.moveTo(this);

			},


			//
			// COPY AND PASTE
			//

			/*
			 * cutThis
			 *
			 */

			cutThis : function (_r) {

				// Keep in memory in raw form
				memory.set(this)

				// Remove from tree
				commandFunctions.deleteThis.apply(this);

			},

			/*
			 * copyThis
		 	 *
			 */
			
			copyThis : function (_r) {

				// Keep in memory in raw form
				memory[_r || '_'] = { name : this.name, value : this.raw() };

			},

			pasteAsThis : function (_r) {

				var fetched = memory.getRaw(_r);

				thisSetValue(fetched);

			},

			pasteAfterThis : function (_r) {

				// Fetch gets back name and raw json string
				var fetched = memory.get(_r);

				console.log("PasteAfter - Fetched result =", fetched);

				// Loop for collections
				//for (var i = 0; i < dataArray.length; i++) {

					this.parent.adoptAt(this.getIndex() + 1, fetched);

				//}

			},

			pasteIntoThis : function (_r) {

				var fetched = memory.get(_r);

				console.log("PasteInto - Fetched result =", fetched);

				// Loop for collections
				//for (var i = 0; i < dataArray.length; i++) {

					this.adoptAt(this.children.length, fetched);

				//}

			},

			swapWithPrev : function () {

			},

			swapWithNext : function () {

			},







			//
			// Type Coersion
			//

			forceTypeString : function () {

				cursor.become('string');

			},

			forceTypeNumber : function () {

				cursor.become('number');

			},

			forceTypeObject : function () {

				cursor.become('object');

			},

			forceTypeArray : function () {

				cursor.become('array');

			},

			forceTypeBoolean : function () {

				// If value is truthy, force true
				var testValue = cursor.value;

				if (testValue) { 

					cursor.become('true');

				} else {

					cursor.become('false');

				}

			},

			forceTypeNull : function () {

				cursor.become('null');

			},


			/* editTypeBake
			 *
			 * turns object into a string node whose value 
			 * is the stringification of the initial object
			 *
			 */

			editTypeBake : function () {

				var jsonString = JSON.stringify(cursor.value);

				cursor.become('string');

				cursor.setValue(jsonString);

			},


			/* editTypeToggle
			 *
			 * polymorphic
			 *
			 * for true or false type nodes, switches between them
			 * for arrays, turns them into objects
			 * for numbers, turns them into strings
			 *
			 */

			editTypeToggle : function () {

				if (this.type === 'number') {

					this.become('string');

				} else if (this.type === 'string') {

					if (inferType(this.value) === 'number') {

						this.become('number');

					}

				} else if (this.type === 'true') {

					this.become('false');

				} else if (this.type === 'false') {

					this.become('true');

				}

			},


			// 
			// SPECIAL OPERATIONS
			//


			/* 
			 * editIncrement
			 *
			 */

			editIncrement : function (_amount) {

				var incrAmount = _amount || 1;

				this.setValue(this.value + incrAmount);

			},


			/* 
			 * editDecrement
			 *
			 */

			editDecrement : function (_amount) {

				var incrAmount = _amount || 1;

				this.setValue(this.value - incrAmount);

			},



			//
			// DEBUG COMMANDS
			//

			/*
			 * debugPrintCurrent	-	output current node using native Node toString
			 *
			 * no parameters
			 *
			 */

			debugPrintCurrent : function () {

				this.print();

			},


			/*
			 * debugPrintVerbose	-	output current node using verbose property iteration
			 *
			 * no parameters
			 *
			 */

			debugPrintVerbose : function () {

				this.print(true);

			},


			//
			// DEFAULT
			//


			/*
			 * noCommand
			 *
			 * default
			 *
			 */

			noCommand : function () {

				console.warn("No command bound to this key");

			}


	};




	/*
	 * ==============================================================================================
	 *
	 * Methods of class Interface
	 *
	 * end list of command implementations
	 *
	 *
	 */

	/* 
	 * hasType			-	check this nodes type against a list to check for membership
	 *
	 * _node	:	node to examine
	 * _types	:	list of types to check against 
	 *
	 */

	function hasType (_node, _types) {

		var thisType = _node.type;

		for (var i = 0, l = _types.length; i < l; i++) {

			if (_types[i] === thisType || _types[i] === 'all') {

				return true;

			}

		}

		return false;

	}




	/*
	 * receiveCommand	-	this takes commands from the event listener in the form of
	 * 						command objects. If a command expects a vim-style range to operate on,
	 *						it always should be first in the args array.
	 *
	 * command	: incoming command
	 *
	 * TODO: parameters
	 *
	 */

	function receiveCommand (_command) {

		var target		= cursor.getCurrent(),
			cmd			= _command.name,
			args		= _command.args,
			info		= commandBank[cmd];

		// console.log("Executing: " + cmd + " with", (args.length) ? args : "no arguments");

		// Check command metadata exists
		if (typeof info === 'undefined') {

			App.console.error("Interface.receiveCommand: No entry for '" + cmd + "'.");
			return;

		}

		// Check node types
		if (!hasType(target, info.types)) {

			App.console.error("Interface.receiveCommand: Node type '" + target.type + "' does not accept '" + cmd + "'.");
			return;

		}

		// Check function arity
		if (args.length > info.arity) { 

			App.console.error("Interface.receiveCommand: Too many arguments (" + args.length + ") for '" + cmd + "'.");
			return;

		}

		// Check command implementation exists
		if (typeof commandFunctions[cmd] === 'undefined') {

			App.console.error("Interface.receiveCommand: Command implementation not found: '" + cmd + "'.");
			return;

		}

		// Apply the command
		commandFunctions[cmd].apply(target, args);

		// Post-execution cleanup
		if (info.refresh) {

			cursor.refreshList();

		}

		// Perform callback if present
		if (_command.callback) {

			_command.callback();

		}

	}





	/*
	 * Return
	 *
	 */


	return {

		'do' : receiveCommand

	}

}


