
/*
 * Dialog Box Class
 *
 */


var Dialog = function Dialog (_config, _submit) {

	// Extend config object with incoming options
	var config = $.extend({

		title:			"Dialog Title",
		message:		"Message body",
		text:			"{\n\n}",
		fields:			[ { name : "Default Field", value : "Default Value" } ],
		buttons: 		[ { name : "Accept", value : 1 }, { name : "Cancel", value : 0 } ],

	}, 	_config);

	var $this = null;

	function init () {

		// Create dialog
		$this = createDialog();

		// Reveal
		show();

		// Standard bindings
		$this.bindKey(27, function () { _submit(); close(); });
		// $this.blur(function () { _submit(); close() }); <-- need better way to do this

	}

	function createDialog () {

		// Make base dialog box
		var $newBox  = $("<div>", { class : 'dialog-box' }),
			$title	 = $("<h3>",  { text  : config.title }).appendTo($newBox);

		// Make info if requested
		switch (config.type) {

			case "info":

				$newBox.append($("<p>", { text : config.message }));

				$newBox.bindKey(13, close, true);

				break;


			case "text":

				for (var field in config.fields) {

					var $newField = makeField(config.fields[field]);
					$newBox.append($newField);
			
				}

				$newBox.bindKey(13, function () {

					var values = [];
					$this.find('input').each(function () { values.push(this.value); });
					_submit(values);

					close();

				}, true);

				break;


			case "json":

				var $jsonText = $("<textarea>", { text : config.text });
				$newBox.append($jsonText);

				$newBox.bindKey(13, function () {

					_submit($jsonText.val());

					close();

				}, true);

				break;

			
			case "choice":

				for (var button in config.buttons) {

					var $newButton = makeButton(config.buttons[button]);
					$newBox.append($newButton);

				}

				break;


			default:

				$newBox.append($("<h4>", { text : "Dialog not configured." }));

		}

		return $newBox;

	}		

	// Template for text entry field
	function makeField (_fldObj) {

		var $i = $("<input>", { type : 'text', value : _fldObj.value });


		return $i;

	}

	// Template for button
	function makeButton (_btnObj) {

		var $b = $("<button>", { 'text' : _btnObj.name });

		$b.click(function () { _submit.call(_btnObj.value); close(); });

		return $b;

	}

	// Reveal dialog
	function show () {

		$('body').append($this.hide());

		$this.slideDown(200).find("input, button, textarea").first().focus().select();

	}

	// Dismiss dialog
	function close () {

		$this.slideUp(200, function () { $this.remove(); });

	}

	// Start
	if (!config.type) {

		console.error("A.newDialog: No dialog type supplied.");

	} else {

		init();

	}
	
}







/*
 * Input Sanitiser - turns string into user's intended input (hopefully)
 *
 */

function sanitise (_x) {

	var type = inferType (_x),
		x	 = _x,
		y 	 = undefined;

	switch (type) {

		case "null":  y = null;  break;
		case "false": y = false; break;
		case "true":  y = true;  break;

		case "number": 
			y = Number(x); 
			break;

		case "string": 
			y = x.replace(/^"/, '').replace(/"$/, '');
			break;

		case "array":
		case "object":

			try { 

				y = JSON.parse(x); 

			} catch (_ex) { 

				App.console.error("Input interpreted as JSON, but didn't parse");

				y = null; 

			}

			break;

		default:
			console.error("Couldn't detect input type.");

	}

	// console.log("Sanitise:", _x, ">", type, ">", y);

	return y;

}





/*
 * inferType	-	attempts to guess the data type the user was trying to input by
 * 					analysing input as a string for clues as to the intended data type.
 * 					Returns string representing the guessed type.
 *
 * _value:		value string to guess from
 *
 *
 * NOTE: loggable version. Replace 'y =' with 'return' to create more efficient, but difficult to log, version.
 *
 * ALSO NOTE:
 *
 * Inference of type from user-typed text should be done at the text entry stage.
 * Values passed to node creation functions should already be wither leaves whose
 * values are true primitive data types or real js objects and not string representations.
 *
 */


function inferType (_value) {

	var x = String(_value),
		y = "";

	var z = isA(_value);

	if (z !== 'string') {

		y = z;

	} else {

		// if string is exactly true, false, or null, use primitives
		if (x === 'null' || x === 'false' || x === 'true' ) { y = x; }

		// if the string contains ONLY numbers and periods, it's probably a number
		else if (x.match(/^[-]*[\.\deE\+]+$/)) { y = 'number'; }

		// if the string begins with '{' or '[', use nesting type respectively
		else if (x.match(/^\{/)) { y = 'object'; }	// }  for vim folding	
		else if (x.match(/^\[/)) { y = 'array'; }	// }  for vim folding

		// Otherwise, it's just a generic string
		else { y = 'string'}

	}

	return y;
	
}



/*
 * Debug functions - take a node
 *
 */

var debug = {


	// dump  -	(debug) dump this node's subtree - recursive print with indentation
	dump : function dump (_this) { 

		console.log("\nTreePrint:");

		_this.recurse(function (_i, _d) {

			var indent = "";

			for (var i = 0; i < _d; i++) {
				indent += "  ";
			}

			console.log(indent + _i + ": " + this.key + ":" + this.type + " ( " + this.value + " ) "); 

		});

	},


	// orderedList	-	(debug) print straight list from recursive traversal
	orderedList : function orderedList (_this) {

		var list = [];

		_this.recurse(function () {

			list.push(this);
			
		});
		
		console.log(list);

	}

};



/*
 * detectType	-	does actual type detection on real instances of data. This is different to
 * 					inferType which runs string tests on string representations of proper data.
 * 					Partly from Crockford's 'remedial' type detection shim 
 * 					[http://javascript.crockford.com/remedial.html].
 *
 * _value:		value of any real data type to run detection over
 *
 */

function isA (_value) {

	var x = typeof _value;

	if (x === 'object') {

		if (_value) {

			if (typeof _value.length === 'number' &&

					!(_value.propertyIsEnumerable('length')) && typeof _value.splice === 'function') {

				x = 'array';

			}

		} else {

			x = 'null';

		}
	}

	if (x === 'boolean') {

		x = (_value) ? 'true' : 'false';

	}

	return x;

}





/*
 * bindKey	-	set up a keydown handler for just one key
 *
 * _keyCode:	key to listen for
 * _fn:			callback to perform when key is received
 * _once:		optional. If truthy, remove listener after first trigger
 *
 * // TODO: Extend this for array of keycodes
 *
 */

$.fn.bindKey = function (_keyCode, _fn, _once) {

	var self = this;

	this.bind('keydown', function bindSingleKey (_key) {

		if (_key.keyCode === _keyCode) {

			_fn.apply(self, [ _key ]);

			if (_once) { self.unbind('keydown', bindSingleKey); }

			return false;

		}

	});

	return this;

};

$.fn.unbindKeys = function () { this.unbind('keydown'); };






/*
 * $.colorByIteration	-	Assign colour classname based on input number to 
 * 							create rainbow effect
 *
 * !! jQuery Extension
 *
 */

$.fn.colorByDepth = function () {

	var i = this.attr('depth') % 7,

		x = (i === 0) ? "red"	 :
			(i === 1) ? "orange" :
			(i === 2) ? "yellow" :
			(i === 3) ? "green"	 :
			(i === 4) ? "cyan"	 :
			(i === 5) ? "blue"	 :
						"purple" ;

	this.removeClass("red orange yellow green cyan blue purple");
	this.addClass(x);
	
}



/*
 * $.paddingX		-	work out how much is taken up beyond an element's width
 *
 */

$.fn.paddingX = function () {

	var left  = this.css('padding-left').replace(/px/, ''),
		right = this.css('padding-right').replace(/px/, '');

	return Number(left) + Number(right);

}
