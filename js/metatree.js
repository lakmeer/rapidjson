var MetaTree = function () {

	/**************************************************
	 * Private properties
	 *
	 */
	var tree = [{
			name	: "__",
			id		: "0",
			value	: null,
			type	: "root",
		}],
		
		currentCursorLocation = "1";

	/*
	 * Add nodes to tree
	 *
	 */

	// add node as child of given id
	// if node comes with it's own id, splice it there
	// if not, give it the next available ID and push it the end
	function addNodeTo (_targetId, _node, _ix) {

		console.log("MetaTree.addNodeTo: " + _targetId + ", { " + toString(_node) + " }");

		// Prevent overriding metadata
		if (_ix && _ix === "0") { return; }

		// Get parent node
		var parent = nodeAt(_targetId);

		// Can't add, no parent
		if (parent === null) { 

			trace.error("Can't add node - no parent at " + _targetId);
			console.log("MetaTree: No parent: " + _targetId);
			return;

		}

		// If node comes with index request
		if (_ix) {

			parent.splice(_ix, 0, [_node]);
			renumber(_targetId);

		// Next available index
		} else {

			_node.id =( (_targetId === "0") ? "" : _targetId + ".") + String(parent.length);
			parent.push([_node]);

		}


	}

	// Insert node at sibling level
	// id is id of node to insert after, or if blank, use cursor
	function insertNode (_id) {

		var id = _id || currentCursorLocation,
			thisNode = nodeAt(id),
			parentId = parentOf(id),
			newNode = [{
				name 	: (nodeAt(parentId)[0].type === "array") ? (localId(id) + 1) : "???",
				value 	: "???",
				id 		: addToId(id, 1),
				type	: "unknown"
			}];

		addNodeTo(parentId, newNode, localId(newNode[0].id));
		nodeAt(parentId)[0].dom.append("<div>BALLS</div");
		renumber(parentId);

		console.log(newNode);


	}


	// Delete node. Re-orders numeric arrays
	function removeNode (_id) {

		console.log(_id);

		var deadNode = nodeAt(_id),
			parent	 = nodeAt(parentOf(_id)),
			index	 = localId(_id);
	
		console.log(_id);	


		parent.splice(index, 1);
		deadNode[0].dom.remove();

		console.log(_id);
		renumber(parentOf(_id));

	}


	// Merge new properties with node metadata
	function updateNode (_id, _changes) {

		var thisNode = nodeAt(_id)[0];

		for (var thisKey in _changes) {

			if (thisKey in thisNode) {

				if (thisKey == "value") { 
					
					updateValue(_id, _changes[thisKey]); 
							
				} else {

					thisNode[thisKey] = _changes[thisKey];

				}
				
				updateDom(_id);

			} else {

				console.log("Can't update '" + thisKey + "' of " + _id + ", it's not a property");
				trace("Can't update '" + thisKey + "' of " + _id + ", it's not a property");

			}

		}

	}


	// Remove all children
	function emptyNode (_id) {

		var thisMetaNode = nodeAt(_id);

		if (thisMetaNode.length < 2) { return; }

		for (var i = 1; i < thisMetaNode.length; i++) {
			var thisChild = thisMetaNode[i];
			console.log("Remove child " + i + "/" + (thisMetaNode.length - 1) + " - " + thisChild[0].id);
			thisChild[0].dom.remove();
		}
			
		thisMetaNode.splice(1, thisMetaNode.length - 1);

		// TODO: Create emptiness value for objects and arrays

		printTree();

		return _id;

	}


	// smart update value - if nesting object, kill children
	function updateValue (_id, _newValue) {

		var thisMetaNode = nodeAt(_id);

		// If nesting, and has some children
		if ((thisMetaNode[0].type === "object" || thisMetaNode[0].type === "array") && thisMetaNode.length > 1) {

			emptyNode(_id);

		}

		thisMetaNode[0].type = inferType(_newValue);
		console.log("Typeguess: ");
		console.log(_newValue);
		console.log("=> " + thisMetaNode[0].type);

		if (thisMetaNode[0].type === "string") { _newValue = _newValue.replace(/^"|"$/g, ''); }
		thisMetaNode[0].value = _newValue;
		updateDom(_id);

	}


	/*
	 * Tree traversal functions
	 *
	 */

	// Return node from id string
	function nodeAt (_id) {

		if (_id == "0") { return tree; }

		var idParts		= String(_id).split('.'),
			lastParent	= tree;

		until(idParts.length, function (_i) { lastParent = lastParent[idParts[_i]]; });

		return lastParent;
	}

	// General purpose tree walk - takes a start node and a success condition, which is a function that takes an ID for testing and return boolean.
	function walk (_id, _fn) {
		
		var result = null,
			done = false;

		function r (_metaNode) {
		
			var thisId = _metaNode[0].id;

			// Test for end condition
			if (_fn(thisId) === true) { result = thisId; done = true; return; }

			// Check for more children
			if (_metaNode.length > 1 && !_metaNode[0].folded) {

				for (var i = 1; i < _metaNode.length; i++) {
					
					r(_metaNode[i]);

					if (done) { return; }

				}
			}
		}
		
		return result;

	}

	// Find :: parent of given id
	function parentOf (_id) {

		return (routeId(_id) === '0') ? _id : routeId(_id);

	}

	// Find :: previous display row
	function prevAnythingOf (_id) {

		var previousId = '1',
			result = _id,
			done = false;			// TODO: Is this a hack?? research algorthims

		function r (_metaNode) {
		
			var thisId = _metaNode[0].id;

			// Test for end condition
			if (thisId === _id) { result = previousId; done = true; return; }

			// Update backreference, unless it's the tree in which case skip it
			previousId = (thisId !== '0') ? thisId : previousId;

			// Check for more children
			if (_metaNode.length > 1 && !_metaNode[0].folded) {

				for (var i = 1; i < _metaNode.length; i++) {
					
					r(_metaNode[i]);

					if (done) { return; }
				}
			}
		}

		r(tree);

		return result;

	}

	// Find :: next display row
	function nextAnythingOf (_id) {

		var previousId = '0',
			result = _id,
			done = false;

		function r (_metaNode) {
		
			var thisId = _metaNode[0].id;

			// Test for end condition
			if (previousId === _id) { result = thisId; done = true; console.log("Found: " + thisId + " - prev=" + previousId + ", target=" + _id); return; }

			// Update backreference, unless it's the tree in which case skip it
			previousId = (thisId !== '0') ? thisId : previousId;

			// Check for more children
			if (_metaNode.length > 1 && !_metaNode[0].folded) {

				for (var i = 1; i < _metaNode.length; i++) {
					
					r(_metaNode[i]);

					if (done) { return; }

				}
			}
		}

		r(tree);

		return result;

	}

	// Find :: Previous sibling (strict)
	function prevSiblingOf (_id) {

		var index = localId(_id);

		// start of family
		if (index === "1") {
			
			return _id;

		} else {
			
			return addToId(_id, -1);

		}

	}

	// Find :: Next sibling (strict)
	function nextSiblingOf (_id) {

		console.log("Not written yet");

	}

	// Find :: First child
	function firstChildOf (_id) {

		var thisMetaNode = nodeAt(_id);

		// If folded, open
		if (thisMetaNode[0].folded === true) { fold(_id); }

		// if no children, don't bother
		if (thisMetaNode.length < 2) { return _id; }

		// if still here, get first child
		return _id + '.1';

	}

	// Find :: Last child
	function lastChildOf (_id) {

	}

	/*
	 * Helpers
	 *
	 */

	// inferType - automagically guess the intended type of a freshly typed string
	function inferType (_value) {

		//if (!options.typeguessing) { return false; }

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

	// Reapply numeric IDs if they have shifted - takes parent to sort children
	function renumber (_id) {

		var parent = nodeAt(_id),
			newId = "",
			isArray = (parent[0].type === 'array');

		// For each child of moved item
		for (var i = 1; i < parent.length; i++) {

			newId = (_id === "0") ? i : _id + "." + i;

			parent[i][0].id = newId;

			// if an array, the names are controlled automatically, and should be updated here also, except zero-indexed
			if (isArray) { parent[i][0].name = i - 1; }

			renumber(newId);

		}	

	}

	/*
	 * ID String manipulation
	 *
	 */

	// parentID : get parent segment of id
	function routeId (_id) {
		
		var parts	= _id.split('.');
		
		if (parts.length > 1) {

			parts.splice(parts.length - 1, 1);
			return parts.join('.');

		} 

		// if only one segment long, parent is the root
		return "0";

	}

	// localId : get child segment of id
	function localId (_id) {

		var parts = _id.split('.');
		return parts[parts.length - 1];

	}

	// toString for metanodes
	function toString (_thisNode) {

		return _thisNode.id + " : " + _thisNode.name + " (" + _thisNode.type + ") = " + _thisNode.value;

	}

	// Increment or decrement ID strings by some amount
	function addToId(_id, _d) {

		return verifyId( routeId(_id) + '.' + String(Number(localId(_id)) + _d) );

	}

	// Strip malformed ids with zero in them
	function verifyId (_id) {

		return _id.replace(/^0\./, '');

	}

	/*
	 * View controls
	 *
	 */

	// Flush metatree changes down to their respective dom elements
	function updateDom (_id) {

		var thisNode = nodeAt(_id)[0];
		
			thisNode.dom.setValue(thisNode.value);
			thisNode.dom.setName(thisNode.name);
			thisNode.dom.setId(thisNode.id);
			thisNode.dom.setType(thisNode.type);

		// TODO: selected/cursor states here?
	}


	// Focus cursor on this node
	function focusOn (_id) {

		console.log("MetaTree:focusOn - " + _id);

		nodeAt(currentCursorLocation)[0].dom.removeClass('cursor');
		nodeAt(_id)[0].dom.addClass('cursor');

		currentCursorLocation = _id;

	}


	// Add node to selection array
	function select (_id) {

		var thisNode = nodeAt(_id);

		thisNode[0].selected = true;

		thisNode[0].dom.addClass('selected');

	}

	// Toggle folded state - optional force argument sets state regardless of current state
	function fold(_id, _force) {
		
		// If no node specified, use cursor location
		var id = _id || currentCursorLocation;
			
		// if not foldable, fold parent
		if (nodeAt(id).length === 1) { id = parentOf(id); }
	   
		// if we're now at the root node, bail
		if (id === "0") { return; }
			
		var thisNode = nodeAt(id)[0];

		// If no force value, toggle this node
		if (typeof _force === 'undefined') {

			thisNode.folded = !thisNode.folded;
			thisNode.dom.toggleClass('folded');

		// If forced to fold, fold
		} else if (_force === true) {

			thisNode.folded = true;
			thisNode.dom.addClass('folded');

		// Otherwise, forced to unfold
		} else {

			thisNode.folded = false;
			thisNode.dom.removeClass('folded');

		}

		// Refocus in case cursor moved
		focusOn(id);

	}

	function foldAll (_id) {

		var thisNode = nodeAt(_id)[0];

		// If folded, unfold all
		if (thisNode.folded === false) {

			walk(_id, function (_thisId) { fold(_thisId, false); });

		// If unfolded, fold all
		} else {

			walk(_id, function (_thisId) { fold(_thisId, true); });

		}

		// Finally, fold self
		fold(_id);
	}


	/*
	 * Debug output
	 *
	 */

	function printTree (_currentNode, _depth) {

		var thisNode	= _currentNode || tree,
			depth		= _depth || 0,
			spaces		= "";

		if (!_currentNode) { console.log("MetaTree.print:\n--------------------------"); }

		until(depth, function() { spaces += "   "; });

		console.log(spaces + toString(thisNode[0])); 

		for (var i = 1; i < thisNode.length; i++) {
	
			printTree(thisNode[i], depth + 1);

		}

	}




	/**************************************************
	 * Init Phase
	 *
	 */

	return {

		dump		:	function () { console.log(tree); },
		print		:	printTree,
		query		:	nodeAt,
		current		:	function () { return currentCursorLocation; },

		addTo		:	addNodeTo,
		insert		:	insertNode,
		remove		:	removeNode,
		update		:	updateNode,
		fold		:	fold,

		select		:	select,
		move		:	{

			prev		:	function () { focusOn( prevAnythingOf	(currentCursorLocation)); },
			next		:	function () { focusOn( nextAnythingOf	(currentCursorLocation)); },

			up			:	function () { focusOn( parentOf			(currentCursorLocation)); },
			into		:	function () { focusOn( firstChildOf		(currentCursorLocation)); },
		
			last		:	function () { focusOn( lastSiblingOf	(currentCursorLocation)); },
			first		:	function () { focusOn( firstSiblingOf	(currentCursorLocation)); },
			
			firstChild	:	function () { focusOn( firstChildOf		(currentCursorLocation)); },
			lastChild	:	function () { focusOn( lastchildOf		(currentCursorLocation)); },

			to			:	function (_id) { focusOn(_id); }

		}

	}

}

















/*
 * ECMA5 forEach 
 *
 */

if ( !Array.prototype.forEach ) {

  Array.prototype.forEach = function( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( " this is null or not defined" );
    }

    var O = Object(this),
    	len = O.length >>> 0;

    if ( {}.toString.call(callback) != "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    if ( thisArg ) { T = thisArg; }

    k = 0;

    while( k < len ) {
      var kValue;
      if ( k in O ) {
        kValue = O[ Pk ];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };
}
