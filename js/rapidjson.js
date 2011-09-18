var JsonTree = function (_host) {
	
	var $host		= $(_host),				// Host element
		rawJson		= {},					// Raw data
		$cursor		= null;					// current cursor location


	/*
	 * Private Contructor : 
	 * New row for DOM table
	 *
	 */

	function Row (_id, _name, _type, _value, _depth) {

		var	value		= _value || "Value Here",
			name		= _name || "NEW",
			d			= _depth || 0;

			// new DOM objects
			$newRow 	= $("<div class='node'></div>").addClass(_type).attr('depth', _depth),

			$spanName	= $("<span></span>").addClass('name' ).html(name),
			$spanValue	= $("<span></span>").addClass('value').html(value);
		
		// Assemble
		$newRow.append($spanName).append($spanValue);

		// Setting functions
		$newRow.setValue	= function (_newVal)	{ $spanValue.html(_newVal); };
		$newRow.setName		= function (_newName)	{ $spanName.html(_newName); };
		$newRow.setType		= function (_newType)	{ $newRow.removeClass('object array string number true false null').addClass(_newType); };

		// Colorise 
		$newRow.addClass(colorByIteration(d));

		// Done
		return $newRow;

	}



	/*
	 * Tests
	 *
	 */
	
	// isEmpty - check for zero children in objects and arrays
	function isEmpty (_subject) {

		for (var thisProp in _subject) {

			if (_subject.hasOwnProperty(thisProp)) { return false; }

		}

		return true;

	}

	// isArray - distinguish array from objects
	function isArray (_thisThing) {

		return (typeof _thisThing === "object" && !_thisThing.length);

	}

	// Assign colour classname based on input number
	function colorByIteration (_i) {

		var i = _i % 7;

		return	(i === 0) ? "red"	 :
				(i === 1) ? "orange" :
				(i === 2) ? "yellow" :
				(i === 3) ? "green"	 :
				(i === 4) ? "cyan"	 :
				(i === 5) ? "blue"	 :
							"purple" ;
			
	}
	

	// findType - given an object of any kind, return string of it's json RFC type
	function findType (_subject) {

		return	(typeof _subject === "string")				? "string"	:
				(typeof _subject === "number")				? "number"	:
				(typeof _subject === "boolean" && _subject)	? "true" 	:
				(typeof _subject === "boolean")				? "false"	:
				(_subject		 === null) 					? "null" 	:
				('length' 		 in _subject)				? "array"	:
															  "object"	;

	}


	// inferType - manually guess the intended type of a freshly typed string
	function inferType (_value) {

		console.log("Infertype: " + _value);

		if (!options.typeguessing) { return false; }

		var x = String(_value);

		// Start by assuming a string
		// if string is exactly true, false, or null, use primitives
		if (x === 'null' ) { return 'null';  }
		if (x === 'false') { return 'false'; }
		if (x === 'true' ) { return 'true';  }

		// if the string contains ONLY numbers, it's probably a number
		if (x.match(/^\d*$/)) { return 'number'; }

		// if the string begins with '{' or '[', use nesting type respectively
		if (x.match(/^\{/)) { return 'object'; }
		if (x.match(/^\[/)) { return 'array'; }

		return 'string';

		// TODO: Make node visually red on typeguessing failure


	}


	/*
	 * Recursive tree parser
	 *
	 * inputNode - the current node from the incoming object
	 * id		 - the dotted id of the new object. parent is inferred
	 * key		 - the key name of the incoming node
	 * domParent - element to insert resulting dom node into - TODO: Can be supplanted by metatree queries, but less recursive in style
	 *
	 */

	function parseNode(_inputNode, _id, _key, _$domParent, _depth) {

		var id			= String(_id),
			//parentId 	= getParentId(id),
			type		= findType(_inputNode),
			$newRow		= new Row(id, _key, type, "", _depth),
			newNode		= { 
				name	: _key, 
				value	: null, 
				type	: type, 
				dom		: $newRow, 
				selected: false, 
				folded	: false, 
				id		: id 
			};

		switch (type) {

			// Primitive valueless types
			case "null":
			case "true":
			case "false":

				// Set values
				var $icon = $("<span>").addClass("icon").html(type);
				newNode.value = _inputNode;
				$newRow.setValue($icon);

				// Save metanode
				//metaTree.addTo(parentId, newNode);

				break;

			// Primitive value types
			case "string":
			case "number":

				// Set values
				newNode.value  = _inputNode;
				$newRow.setValue(_inputNode);

				// Save metanode
				//metaTree.addTo(parentId, newNode);

				break;

			// Nesting types
			case "array":
			case "object":

				var brace = (type === "array") ? ["[", "]"] : ["{", "}"],
					childCounter = 0;

				// Save metanode
				//metaTree.addTo(parentId, newNode);

				//  Set values depending on exact nest type
				if (isEmpty(_inputNode)) {

					newNode.value = null;
					$newRow.setValue(brace[0] + " <span class='empty'>empty</span> " + brace[1]);

					break;

				} else {

					$newRow.setValue(brace[0] + "<span class='ellipsis'> . . . " + brace[1] + "</span>");

				}
				
				// If we made it this far, some children exist.

				// Recurse over children, pass this row as parentrow and new key and id values
				for (var thisKey in _inputNode) {

					var newId = id + "." + String(++childCounter);
					parseNode(_inputNode[thisKey], newId, thisKey, $newRow, _depth + 1);

				}

				break;

			// Unknown types
			default: 

				// WTF is this ??
				console.log("Unsupported node type detected: " + type);

				break;

		}

		_$domParent.append($newRow);
		
	}

	/*
	 * Handle keyboard input
	 *
	 */

	function handleInput (_commandEvent) {
		
		trace.both(":: " + _commandEvent.originalEvent.cmd);

		switch (_commandEvent.originalEvent.cmd) {

			// Undefined
			case "undefinedCommand":

				trace.log("This key isn't mapped");
				break;

			// Movement
			case "moveToParent":

				moveCursor($cursor.parent());

				//metaTree.move.up();
				break;

			case "moveToFirstChild":

				////metaTree.move.firstChild();
				break;

			case "moveToPrevAnything":

				var $allNodes = $(".node");
				var thisIndex = $allNodes.index($cursor);
				moveCursor($allNodes.eq(thisIndex - 1));
				//	metaTree.move.prev();
				break;

			case "moveToNextAnything":

				var $allNodes = $(".node");
				var thisIndex = $allNodes.index($cursor);
				moveCursor($allNodes.eq(thisIndex + 1));
				// metaTree.move.next(); 
				break;

			// Folding
			case "foldThis":

				//metaTree.fold();
				break;

			case "foldAll":

				//metaTree.foldAll();
				break;

			// Editing
			case "editValue":
			case "editNextField":

				modifyField($cursor, "value");
				break;
			
			case "editName":
			case "editPrevField":

				modifyField($cursor, "name");
				break;
			
			// Node
			case "insertSiblingAfter":

				var $newRow;

				if ($cursor.parent().hasClass("array")) {

					trace.log($cursor.parent().children().index($cursor));

					$newRow = new Row("noID", $cursor.parent().children().index($cursor) - 1, "string", "", $cursor.attr('depth'));

				} else {

					$newRow = new Row("noID", "NEW", "string", "", $cursor.attr('depth'));

				}

				$cursor.after($newRow);
				moveCursor($newRow);

				modifyField($newRow, "name");

				break;
			
			case "insertSiblingBefore":

				var $newRow;

				if ($cursor.hasClass("array")) {

					$newRow = new Row("noID", $cursor.parent().children().index($cursor), "string", "", $cursor.attr('depth'));

				} else {

					$newRow = new Row("noID", "NEW", "string", "", $cursor.attr('depth'));

				}

				$cursor.after($newRow);
				moveCursor($newRow);

				modifyField($newRow, "name");

				break;

			case "insertChildHere":

				var $newRow;

				if ($cursor.hasClass("object")) {
					
					$newRow = new Row("noID", "NEW", "string", "", $cursor.parent().attr('depth') + 1 );

				} else if ($cursor.hasClass("array")) {

					$newRow = new Row("noID", $cursor.children(".node").length, "string", "", Number($cursor.attr('depth')) + 1 );

				} else {

					trace.both("Node is not capabale of containing children");
					return;

				}

				$cursor.append($newRow);

				moveCursor($newRow);
				modifyField($newRow, "name");
				
				break;

			case "insertChildLast":
				break;

			case "deleteThis":

				var $this = $cursor;
				newCommand("moveToNextSibling");
				$this.remove();
				break;

			case "deleteAllChildren":

				$cursor.children(".node").remove();
				break;


			default:
				console.log("No binding for this yet: " + _commandEvent.originalEvent.cmd);

		}		

	}



	/*
	 * Issue internal command
	 *
	 */

	function newCommand (_command) {

		handleInput({ originalEvent : { cmd : _command } });

	}


	/*
	 * Enforce type on a node
	 *
	 */

	function setType (_$node, _type) {

		_$node.removeClass("object array string number true false null").addClass(_type);

	}


	/*
	 * Modify values
	 *
	 */

	function modifyField ($this, _target) {

		var $field = $this.children("." + _target),
			$textBox = $("<input type='text' />").val($field.text());

		// TODO: This needs to be reconsidered properly
		if ($this.parent().hasClass("array")) {
			
			$field = $this.find(".value");

		}

		$field.addClass('modify').append($textBox);
		
		$textBox.select().focus();
		
		Keyboard.pause();

		$textBox.bind('keydown', function (_key) {

			// Return (accept)
			if (_key.keyCode === 13) {

				$field.removeClass('modify');
				$field.html($textBox.val());

				Keyboard.resume();

				setType($this, inferType( $textBox.val() ) );

			// Tab (next)
			} else if (_key.keyCode === 9) {

				$field.removeClass('modify');
				$field.html($textBox.val());
				
				// If going backwards and reached next node
				if (_key.shiftKey && _target == "name") {

					newCommand("moveToPrevAnything");
					modifyField($cursor, "value");

				// If going backwards but staying on this node
				} else if (_key.shiftKey) {

					modifyField($this, "name");

				// If going forward and staying on this node
				} else if (_target === "name") {

					modifyField($this, "value");

				// If going forward and mobing on to next node
				} else {

					newCommand("moveToNextAnything");
					modifyField($cursor, "name");

				}				
			
			// Escape (cancel)
			} else if (_key.keyCode === 27) {

				$textBox.blur();
				Keyboard.resume();

			} else {

				return (_key);

			}

			_key.preventDefault();
			return false;

		});
		
		$textBox.blur (function () { $textBox.remove(); });
		$textBox.click(function () { return false; });

	}


	/*
	 * Collapse a nesting node
	 *
	 */

	function collapseThis (_event) {
		
		var $this	= $(this).parent(),
			id		= $this.attr('id');


		$this.toggleClass('collapse');  

		//metaTree.fold(id);

		_event.preventDefault();
		return false;
	
	}



	/*
	 * Move Cursor
	 *
	 */

	function moveCursor (_target) {

		var $this = $(_target);

		$cursor.removeClass('cursor');
		$this.addClass('cursor');

		$cursor = $this;
		
	}



	/*
	 * Begin tree creation from JSON data
	 *
	 */

	function build (_rawJson) {

		// If no host defined yet, bail
		if ($host === {}) { alert("No host element defined"); return; }

		// Make tree
		var counter = 0;

		for (var thisKey in _rawJson) {

			parseNode(_rawJson[thisKey], ++counter, thisKey, $host, 0);

		}

		// Select root
		$cursor = $(".node").first();
		moveCursor($cursor);

	}

	// Listen for commands from Keyboard
	$(document).bind('command', handleInput);


	return {
		build	: build,
		command : newCommand
	};

};








