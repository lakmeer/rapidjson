/*
 * Cursor
 *
 * Cursor handles interactions between the app proper and the tree of nodes. It does things
 * like monitor which node the cursor is at, which nodes are selected and so on. It uses an
 * event listener to monitor for process requests coming from the app.
 *
 * Cursor maintains pointers into the actual Node tree, as well as an ordered list which maps
 * more accurately to what the user sees and interacts with. The ordered list is also used to 
 * make searching over the data more efficient and to make more sense.
 *
 * Cursor also handles selection, and the creation of collections of multiple nodes that aren't 
 * related in direct genealogical ways.
 *
 */






var Cursor = function (_root) {

	var root			= _root,
		cursor			= root.children[0],
		list			= [],
		foldedList		= [];


	/*
	 * setCursor	-	change cursor location to here
	 *
	 * _node	:	canbe either a real node or query string
	 *
	 */

	this.moveTo = function (_node) {

		// App.console.log(_node.key);
		//console.log('moveTo');

		// Remove cursor flag from current location, unless it's lost, cos it doesn't have one)
		cursor.dom.removeClass('cursor');

		// If the list is totally empty, park the cursor on the root node to stop it getting lost
		if (list.length < 1) { cursor = root; return; }

		// Choose lookup method (string or node)
		cursor = _node; //(typeof _node === 'string') ? list[indexOf(_node)].node : _node;

		// Put flag in new location
		cursor.dom.addClass('cursor');

	}


	/*
	 * moveToTop	-	set cursor to first item in list
	 *
	 * no parameters
	 *
	 */
	
	this.moveToTop = function () {

		// !! Deliberately skips root node because this is almost never what you want

		this.moveTo(list[1].node);

	}


	/*
	 * moveToBottom	-	set cursor to last item in list
	 *
	 * no parameters
	 *
	 */

	this.moveToBottom = function () {

		this.moveTo(list[list.length - 1].node);

	}



	/*
	 * refresh		-	rebuild list from current node
	 *
	 * no parameters
	 *
	 */

	this.refreshList = function refreshList () {

		var newList = [];

		// Get all nodes in order
		root.recurse(function () { 
		
			newList.push({ "ref" : this.lineage(true), "node" : this }); 
		
		});

		// Use truncated list
		list = newList;

		this.refreshFolded();

	}



	/*
	 * refreshFolded	-	create the list that doesnt include folded nodes
	 *
	 * no parameters
	 *
	 */

	this.refreshFolded = function refreshFolded () {

		foldedList = [];

		function compile () {

			foldedList.push({ 'ref' : 'QUERYSTRING', 'node' : this });

			if (!this.folded) {

				for (var i = 0, max = this.children.length; i < max; i++) { 

					compile.apply(this.children[i]);

				}

			}

		}

		compile.apply(root);
		
	}



	/*
	 * print		-	just print the entire list in it's current state
	 *
	 * no parameters
	 *
	 */

	this.printList = function print () {
	
		console.log("\nStatic list print:");	
		for (var i = 0, max = list.length; i < max; i++) {

			var thisItem	= list[i],
				tabs		= 4 - Math.floor(thisItem.ref.length / 7),
				tabstop		= ""

			for (var ii = 0; ii < tabs; ii++) { tabstop += "\t"; }

			console.log(( (cursor === list[i].node) ? "> " : "  " ) + list[i].ref + tabstop + list[i].node.value);

		}
	}



	/*
	 * indexOf		-	scanning function to return list index of node requested
	 *					in query form (dotted keys).
	 *
	 *	_q	:	the query to run
	 *
	 */

	this.indexOf = function indexOf (_q, _list) { 

		for (var thisIx = 0, max = _list.length; thisIx < max; thisIx++) {

			if (_list[thisIx].ref === _q || _list[thisIx].node === _q) { return thisIx; }

		}

		return -1;

	}


	

	/*
	 * getCurrent		-	return up to date cursor pointer
	 *
	 * no parameters
	 *
	 */

	this.getCurrent = function getCurrent () {

		return cursor;

	}



	/*
	 * getNext		-	get directly next node from the one specified,
	 *					wraps if at end of list.
	 *
	 */

	this.getNext = function next () {

		// If the cursor is on the root node, it's because no user nodes exist. Do nothing.
		var currentIndex = this.indexOf(cursor, foldedList);

		// If indexOf failed, throw an error
		if (currentIndex < 0) { 
			
			App.console.error("C.foldedList.getNext: Can't find cursor"); 
			return null; 
		
		}

		// If last node in the foldedList, return first one
		if (currentIndex === foldedList.length - 1) {

			return foldedList[1].node;

		}

		return foldedList[currentIndex + 1].node;

	}


	/*
	 * getPrev		-	get directly previous node from the one specified,
	 * 					wraps if at start of list. 	 
	 *
	 * _q	-	query to run
	 *
	 */

	this.getPrev = function getPrev () {

		var currentIndex = this.indexOf(cursor, foldedList); 

		// If indexOf failed, throw an error
		if (currentIndex < 0) { 
			
			App.console.error("C.list.getPrev: Can't find cursor"); 
			return null; 		

		}

		// If first node in the list, return last one
		if (currentIndex === 1) {

			return foldedList[foldedList.length - 1].node;

		}

		return foldedList[currentIndex - 1].node;

	}


	/*
	 * getNextMatch	-	Optional auxiiliary function filters for particular candidates on 
	 * 					some criteria. filters function will be called with test candidate 
	 * 					as 'this' and should return boolean.
	 *
	 * _fn	-	filter function. should return boolean.
	 *
	 */

	this.getNextMatch = function getNextMatch (_test) {

		var thisIx   = this.indexOf(cursor, list),
			thisNode = null;

		if (typeof _test === 'function') { 

			for (var i = thisIx, max = list.length; i !== thisIx - 1; i++) {

				if (i === max) { i = 0; }
				thisNode = list[i].node;

				if (_fn.apply(thisNode)) { return thisNode; }

			}
	
		} else {

			// Start at one so we don't hit the current search result first
			for (var i = 1, max = list.length; i < max; i++) {

				// X is this loop iteration plus offset, wrapping from zero if greater than list length
				var x = i + thisIx; x = (x >= max) ? x - max : x;

				console.log(x);

				thisNode = list[x].node;

				if (String(thisNode.key).match(_test)) { this.moveTo(thisNode); return; }
				   
				if (thisNode.type !== 'object' && thisNode.type !== 'array') { 
					
					if (String(thisNode.value).match(_test)) { this.moveTo(thisNode); return; }

				}

			}

		}
	};



	/*
	 * TODO: getPrevMatch
	 *
	 */

	this.getPrevMatch = function getPrevMatch (_fn) {
		// body...
	}



	/*
	 * reset	-	set cursor to new root node int he event of total tree reset
	 *
	 */

	this.reset = function (_newRootNode) {

		root = _newRootNode;

		cursor = root;

		this.refreshList();
		this.moveTo(root);

	}


	/*
	 * Init
	 *
	 */

	this.refreshList();

}


