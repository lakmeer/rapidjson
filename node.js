/*
 * Class for individual nodes
 *
 */

var Node = function (_id, _name, _value, _type) {

	var name = _name || "???";
	var value = _value || "";

	var type = _type || this.inferType(value);

}






Node.prototype = {

	inferType : function inferType (_test) {

		var x = String(_test);

		if (x === "") { return "null" }

		// if (!options.typeguessing) { return false; }

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

	},

	createDom : function (_id, _name, _type, _value) {

		var	value		= _value || "Value Here",
			numberOfDots = _id.replace(/[^\.]/g, '').length,

			// new DOM objects
			$newRow 	= $("<div class='node'></div>").addClass(_type  ).attr('id', _id),

			$spanName	= $("<span></span>").addClass('name' ).html(_name),
			$spanId		= $("<span></span>").addClass('id'   ).html(_id  ),
			$spanValue	= $("<span></span>").addClass('value').html(value);
		
		// Assemble
		$newRow.append($spanId).append($spanName).append($spanValue);

		// Setting functions
		$newRow.setValue	= function (_newVal)	{ $spanValue.html(_newVal); };
		$newRow.setName		= function (_newName)	{ $spanName.html(_newName); };
		$newRow.setId		= function (_newId)		{ $spanId.html(_newId);		};
		$newRow.setType		= function (_newType)	{ $newRow.removeClass('object array string number true false null').addClass(_newType); };

		// Colorise 
		$newRow.addClass(iterationColor(numberOfDots));

		// Done
		return $newRow;

	},

	update : {

		name : function () {

			   },

		value :  function () {

				 }
	 }



	// inferType - manually guess the intended type of a freshly typed string

	// function newDom
	//
	// function updateValue
	//
	// function updateName
	//
	// function renumberChildren
	//
	// function incrementId
	//
	// function delete
	//
	// function bake
	//
	//



}








	



