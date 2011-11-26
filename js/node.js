
/*
 * Constructor for self-aware json nodes
 *
 * Node methods should support chaining
 * Nodes should be responsible for mainaining a view of themselves
 * Searching operations are outside of the scope
 * Operations concerning subtrees or immediate families can be performed here
 * 
 *
 * Properties:
 *
 * dom				- binding to dom element that represents this node's view.
 * type				- what type of json data this is according to json.org spec.
 * key				- referred key of this node. An automatically assigned number if member of numeric array.
 * value			- stored value - blank if node is of a nesting type.
 * depth			- can be calculated, but this is a handy reference.
 * children			- array of child nodes of this node
 * parent			- all nodes should be able to trivially reference thier parent
 *
 * Methods:
 *
 * become			- force adherence to a new data type, eg: object -> string delete
 * each				- iterate over each child of this node, with callback
 * get				- get an node by key name or lineage from the subtree at this node
 * kill				- kill self and all children, and dom node
 * killAllChildren	- useful for conversion to non-nesting types, and self deletion
 * recurse			- depth-first recurse over children of this node, with callback
 * renumber			- only for arrays, ignores current naming/numbering and enforces new numbers based on current order
 * sort				- sort by key
 * stringify		- output a valid json string describing this subtree with this node as root
 *
 * setValue			- change value to something. Triggers .become() if types differ.
 * setKey			- change key to specified string. Triggers .sort() on parent of array members
 *
 */


var Node = function (_key, _value, _parent) {

	// Basics

	// Type
	this.type		= inferType(_value);

	// History
	this.history	= [];

	// Lineage
	this.children	= [];
	this.myparent		= null;
	this.depth		= 0;

	// View
	this.createDom();
	this.folded		= false;

	// Adopt into supplied parent
	if (_parent) { _parent.adopt(this); }

	// Set all values properly
	this.setKey	(_key);
	this.setValue (_value);
	
}


Node.prototype = function () {


	/*
	 * .adopt	-	add the given node, to your own children but also remove it from previous' parent
	 *
	 * _child:	New node to transfer
	 *
	 */

	this.adopt = function adopt (_child) {

		if (this.type !== 'object' && this.type !== 'array') {
			console.log(".adopt :: can't adopt due to non-nesting type");
			return this;
		}

		_child.detach();

		this.children.push(_child); 

		_child.myparent	= this;
		_child.siblings = this.children;
		
		_child.setDepth(this.depth + 1);

		this.dom.append(_child.dom);

		if (this.type === 'array') { this.renumber(); }

		return this;

	};




	/*
	 * .adoptAt	-	like adopt but inserts child at specific position
	 *
	 * _pos:	zero-index position to insert new child
	 * _child:	new child to adopt
	 *
	 */

	this.adoptAt = function adoptAt (_pos, _child) {

		if (this.type !== 'object' && this.type !== 'array') {
			console.log(".adopt :: can't adopt due to non-nesting type");
			return this;
		}

		// Limit index to no more than length of array
		_pos = (_pos > this.children.length) ? this.children.length : _pos;

		// Detech child from current parent
		_child.detach();

		// Add to this node's children at given postiion
		this.children.splice(_pos, 0, _child); 

		// Update properties
		_child.myparent	= this;
		_child.siblings = this.children;
		_child.setDepth(this.depth + 1);

		if (this.children.length === 1) {

			console.log('no current children');

			this.dom.append(_child.dom);

			
		} else if (_pos < this.children.length - 1) {

			console.log(_pos, this.children.length - 1);

			this.dom.children('.node').eq(_pos).before(_child.dom);

		} else {

			console.log(_pos);

			console.log(this.dom.children('.node').eq(_pos - 1));

			this.dom.children('.node').eq(_pos - 1).after(_child.dom);

			console.log(this.dom.children('.node'));
		}

		if (this.type === 'array') { this.renumber(); }

		return this;

	};




	/*
	 * .become	-	transform this node into another type, converting value if required
	 *
	 * _type:	target type to transform into
	 *
	 */

	this.become = function become (_type) {

		if (this.type === _type) { return this; }

		this.setType(_type);

		switch (_type) {

			// Valueless types
			case "null":

				this.killAllChildren();
				this.setValue(null);

				break;

			case "true":

				this.killAllChildren();
				this.setValue(true);

				break;

			case "false":

				this.killAllChildren();
				this.setValue(false);

				break;


			// Valued types
			case "number":

				this.killAllChildren();
				this.setValue(Number(this.value));

				break;

			case "string":
			
				this.killAllChildren();
				this.setValue(String(this.value));

				break;


			// Nesting types
			case "array":

				this.renumber();
				this.setValue(this.value);

				break;

			case "object":

				this.sort();
				this.setValue(this.value);

				break;


			default:

				App.console.error(".become :: Can't convert this type: '" + _type + "'");

		}

		// this.dom.refresh();

		return this;

	};


	/*
	 * .clone () 	-	create a unique deep clone by iterating key values
	 *
	 * no parameters
	 * 
	 * Note: being careful not to copy self-referential properties like parent,
	 * or siblings because the cloner is not smart enough.
	 *
	 */

	this.clone = function clone() {

		var cloneData = this.raw();

		return new Node(this.name, cloneData);

	}



	/*
	 * createRow	-	Template for creating the DOM representation of each node
	 *
	 */

	this.createDom = function createDom () {

		// new DOM objects
		var $newRow 	= $("<div class='node'></div>").addClass(this.type).attr('depth', this.depth),
			$spanName	= $("<span></span>", { class : 'name',  text : this.key   }),
			$spanValue	= $("<span></span>", { class : 'value', text : this.value });
		
		// Stash references	
		$newRow.$name  = $spanName;
		$newRow.$value = $spanValue;
		
		$newRow.data('json_node', this);

		// Assemble
		$newRow.append($spanName).append($spanValue);

		this.dom = $newRow;

	}


	/*
	 * .detach	-	remove this node from it's parent's child list
	 *
	 * no parameters
	 *
	 */

	this.detach = function detach () {

		if (this.myparent !== null) {

			var siblings	= this.myparent.children,
				index		= siblings.indexOf(this);

			siblings.splice(index, 1);

			if (this.myparent.type === 'array') { this.myparent.renumber(); }

			this.myparent		= null;

			this.dom.remove();

			this.setDepth(0);


			

		}

		return this;

	};





	/*
	 * each		-	iterate over children. takes a callback and provides index reference
	 *
	 * _callback:	function to execute
	 *
	 */

	this.each = function each (_callback) {

		if (this.children.length < 1) { return this; }

		for (var i = 0; i < this.children.length; i++) {

			_callback.apply(this.children[i], [i]);

		}

		return this;

	};




	/*
	 * fold		-	set folded state - toggle if unspecified
	 *
	 * _which:		boolean - true for fold, false for unfold
	 *
	 */

	this.fold = function fold (_which) {

		if (this.children.length < 1) { return this; }

		if (typeof _which == 'undefined') {

			this.folded = !this.folded;
			this.dom.toggleClass('folded');
			return this;

		}

		this.folded = _which;
		this.dom[ _which ? 'addClass' : 'removeClass' ]('folded');

		return this;

	};




	/*
	 * get		-	return node from this subtree by name or lineage (dotted name)
	 *
	 * _key		-	key name of request node in x.y.z form
	 * 
	 */

	this.get = function get (_dottedName) {

		var keys = _dottedName.split('.');

		function search (_this, _target, _depth) {

			if (_this.children.length < 1) { return null; }

			for (var i in _this.children) {

				var thisChild = _this.children[i];

				if ( thisChild.key === _target ) {

					if ( _depth + 1 === keys.length ) {

						return thisChild;

					} else {

						return search(thisChild, keys[_depth + 1], _depth + 1);

					}

				} 

			}

		}

		var result = search(this, keys[0], 0);

		return (!result) ? Node.blank : result;

	}




	/*
	 * getIndex	-	get index relative to siblings
	 *
	 */

	this.getIndex = function getIndex () {

		return this.myparent.children.indexOf(this);

	}




	/*
	 * kill		-	kill self, clean up afterwards
	 *
	 * no parameters
	 *
	 */

	this.kill = function kill () {

		this.killAllChildren();

		this.detach();

		delete this;

		return null;

	}




	/*
	 * killAllChildren	-	does what it says on the box
	 *
	 * no parameters
	 *
	 */

	this.killAllChildren = function killAllChildren () {

		if (this.children.length < 1) { return this; }

		// Go backwards to stop skipping
		var i = this.children.length - 1; 
		
		while (i >= 0) {

			this.children[i].kill(); 
		
			i -= 1;

		};

		this.children = [];

		return this;

	};




	/*
	 * lineage	-	return all parents in dotted formatted (string)
	 *
	 * includeSelf	:	boolean, add self to lineage string if true
	 *
	 * no chaining
	 *
	 */

	this.lineage = function lineage (_includeSelf) {

		function addParents (_this) {

			return "LINEAGE DISABLED"; //((_this.myparent) ? addParents(_this.myparent) + "." : '') + _this.key;

		}

		if (!this.myparent) {

			return (_includeSelf) ? this.key : "none";

		} else {

			return addParents( (_includeSelf) ? this : this.myparent );
		}

	}




	/*
	 * print	-	for printing by console
	 *
	 * _verbose	-	a boolean value, if present, outputs all properties found on this 
	 * 				node except those inhereted from the prototype. Otherwise, prints
	 * 				in a summaried, formatted style.
	 *
	 */

	this.print = function print (_verbose) {
	
		var output = "\n";

		if (!_verbose) {

			output +=	"Node: " + this.key + "\n" +
						"  Value:  " + JSON.stringify(this.value) + "\n" +
						"  Parent: " + this.lineage() + "\n" +
						"  Type:   " + this.type + "\n" + 
						"\n";

		} else {

			output += "Node: " + this.lineage(true) + "\n";

			for (var thisProperty in this) {

				if (this.hasOwnProperty(thisProperty)) { 
						
					output += "  " + thisProperty + ": " + this[thisProperty] + "\n";
					
				}
				
			}

			output += "\n";

		}

		console.log(output);

	};




	/*
	 * raw	-	collapse data structure into JS object
	 *
	 */

	this.raw = function raw () {

		function readNode (_this) {

			if (_this.children.length) {

				var result = (_this.type === 'array') ? [] : {};

				_this.each(function (_x, _y) {

					result[this.key] = readNode(this);

				});

			} else {

				if (_this.type == 'object') { 

					result = {};

				} else if (_this.type === 'array') {

					result = [];

				} else {

					result = _this.value;

				}

			}

			return result;


		}

		return readNode(this);

	};




	/*
	 * .recurse	-	perform a given callback for each node in the subtree given by the callee. Provides depth and index iterators.
	 *
	 * _callback:	execute this per node
	 * _this:		internal counter for current node
	 * _ix:			current index out of siblings
	 * _depth:		current depth of traversal
	 *
	 */

	this.recurse = function recurse (_callback, _this, _ix, _depth) {

		var thisNode	= _this		|| this,
			ix			= _ix		|| 0,
			depth		= _depth	|| 0;

		_callback.apply(thisNode, [ix, depth]);

		for (var i = 0; i < thisNode.children.length; i++) {

			recurse(_callback, thisNode.children[i], i, depth + 1);

		};

	};





	/*
	 * .renumber	-	only applies to arrays, renumbers children without reordering themselves
	 *
	 * no parameters
	 *
	 */

	this.renumber = function renumber () {

		if (this.type !== 'array') { return this; }

		for (var i = 0; i < this.children.length; i++) {

			this.children[i].setKey(i);

		}

		return this;

	}





	/*
	 * setDepth		-	use to ensure that depth update cascades down children as well
	 *
	 * _depth		- new depth value to use
	 *
	 */

	this.setDepth = function setDepth (_depth) {

		this.depth = _depth;
		this.dom.attr('depth', _depth);

		this.dom.colorByDepth();

		this.each(function (_ix) { this.setDepth(_depth + 1); }); 

		return this;

	}





	/*
	 * setName	-	just a key setter. only worth having for the chaining 
	 * 				and maintaining dom view
	 *
	 * _key:	the new key
	 *
	 */

	this.setKey = function setKey (_key) { 
		
		this.key = _key; 
		
		this.dom.$name.html(_key);

		return this; 
	
	};



	/*
	 * setType	-	proper set type for updating dom
	 *
	 * _type:	new type string
	 *
	 */

	this.setType = function setType (_type) {

		this.type = _type;

		this.dom.removeClass("object array string number true false null");
		this.dom.addClass(_type);

		return this;

	};


	/*
	 * setValue	-	almost just a setter but actually changes node type based on entered data
	 *
	 * _value:	the new value on which to transform the node (if required)
	 *
	 * NOTE: This shouldn't be getting raw (stringified) values by this point. Turn them into 
	 * 		 real objects before calling this function.
	 */

	this.setValue = function setValue (_value) {

		// Infer type from supplied value
		var actualType = isA(_value);

		// Park incoming value (will be overwritten ater based on type)
		this.value = _value;

		// If type is different, change into that type (this resets the process, therefore return the function)
		if (actualType !== this.type) { 

			this.become(actualType);
			return false;

		}

		// Create children if necessary
		if (this.type === 'object' || this.type === 'array') {

			this.killAllChildren();

			for (var newChild in _value) {

				var newNode = new Node(newChild, _value[newChild], this);

			}

		}

		// Create view and real version of value based on data type
		switch (actualType) {

			case 'null':
				this.dom.$value.html("null");
				break;

			case 'false':
				this.dom.$value.html("false");
				break;

			case 'true':
				this.dom.$value.html("true");
				break;

			case 'array':
				this.dom.$value.html("[ <span class='ellipsis'> ... ]</span>");
				this.value = "[]";
				break;

			case 'object':
				this.dom.$value.html("{ <span class='ellipsis'> ... }</span>");
				this.value = "{}";
				break;
		
			default:
				this.dom.$value.html(_value);
				
		}

		return this; 

	};





	/*
	 * .sort	-	sort this node's children depending on it's type
	 *
	 * no parameters
	 *
	 * note that sorting SHOULDN'T be done recursively as sometimes the
	 * user will want to keep thier own ordering for certain elements.
	 *
	 */

	this.sort = function sort () {

		// Does this even have any children?
		if (this.children.length < 1) {

			return this;

		}

		// Numeric
		if (this.type === 'array') {

			this.children.sort(function (_A, _B) { 
				return Number(_A.key) - Number(_B.key); 
			});

			return this;

		}

		// Alphanumeric
		this.children.sort(function (_A, _B) { 
			return	(_A.key === _B.key) ? 0 :
					(_A.key  >  _B.key) ? 1 :
					 -1; 			
		});

		return this;

	};



	// Done

	return this;


}();





/*
 * RootNode		-	a special case of Node, only invoked by App during init or load phases.
 *
 * seed	: some data to start the tree with (optional). Null if not supplied.
 *
 */

var RootNode = function (_seed) {

	// Make a normal node but with fixed name
	var seed = _seed || null,
		root = new Node ("_", seed);

	// Special depth sets correct depth for interactable nodes
	root.setDepth(-1);

	// Special root-only flag for other nodes to recognise it with
	root.isRoot = true;

	// Take normal node styling away
	root.dom.removeClass("object").addClass('root');


	// Return finished root node
	return root;
	
}






