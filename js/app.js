// The outer framework for the actual program
var RapidJsonApp = function () {

		// Global options reference
	var options		= {

			typeguessing	: true,
			rainbowcode		: true,
			console			: true,
			colorinvert		: false,
			infopanel		: true

		},

		// Host element
		$host		= $("#json"),

		// Json tree object - handles all the node operations
		jsonTree	= new JsonTree("#json"),

		// padding constant for calculating UI panel widths
		padding		= 20;
	



	/*
	 * Menu operations
	 *
	 * Listen for interactions of the app's menu panel, perform appropriate actions
	 *
	 */

	function menuAction (_actionName) {



	}




	/*
	 * Options
	 *
	 * Do whatever needs doing when options are changed
	 *
	 */

	function setOption (_$option) {

		// Reverse current state to get desired state
		var optionName	= _$option.attr('data-value'),
			value		= !(_$option.hasClass('on'));

		// If this option doesn't exist
		if (typeof options[optionName] === 'undefined') {

			console.log("Not a known option: " + optionName);
			return;
		}

		// Toggle visual feedback state
		if (value) { _$option.addClass('on'); } else { _$option.removeClass('on'); }
		 
		// Store new value
		options[optionName] = value;
	
		// Do any actions specific to certain options
		switch (optionName) {

			case "infopanel":

				if (value) { $("#info").show(); } else { $("#info").hide(); } 
				$(window).trigger('resize');

				break;

			case "console":

				if (value) { $("#console").show(); } else { $("#console").hide(); } 
				$(window).trigger('resize');

				break;

			case "colorinvert":

				if (value) { $("html").addClass('invert'); } else { $("html").removeClass('invert'); } 

				break;
	
			case "rainbowcode":

				if (value) { $host.addClass('rainbow'); } else { $host.removeClass('rainbow'); } 
				break;
	
		}

		// Switch exclusive if required
		if (_$option.parent().hasClass('exclusive')) { 

			_$option.siblings().each(function () { setOption($(this)); });

		}

	
		trace.both("Option set: " + optionName + " -> " + (value ? "on" : "off"));

	}




	/*
	 * loadJson
	 * TODO: This will be ajax in future
	 */

	function loadJson (_json) {

		jsonTree.build(_json);

	}



	/*
	 * Window Management
	 *
	 * Keep various window components in line
	 *
	 */

	function onResize () {

		var windowWidth		= $(window).width() - 2 * padding,
			consoleWidth	= windowWidth / 4 - 1 * padding,
			infoWidth 		= windowWidth / 4 - 3 * padding,
			jsonWidth		= windowWidth - (options.console ? consoleWidth : -1 * padding) - (options.infopanel ? infoWidth : -3 * padding) - 6 * padding;


		if (options.console && options.infopanel) {

			$("#json").css('margin-left', jsonWidth / -2 - padding)

		} else if (options.infopanel) {

			$("#json").css('margin-left', windowWidth / -2)

		} else if (options.console) {

			$("#json").css('margin-left', windowWidth / -2 + consoleWidth + padding);

		} else {

			$("#json").css('margin-left', windowWidth / -2);

		}

		$("#console").width(consoleWidth);				// Console is 1/4 width, with no padding
		$("#info, #info section").width(infoWidth);		// Info panel is 1/4 with padding
		$("#json").width(jsonWidth);					// Json display is two thirds, minus 20px padding

	}





	/*
	 * Bind event listeners
	 *
	 */

	/* Click leaf to modify
	$(".string > .value, .number > .value").live('click', function () { modifyField($(this), "value") });

	// Click nest to collapse
	$(".object > .value, .array > .value").live('click', collapseThis); 
	*/

	// Click to select
	$("#json .node").live('click', function(_evt) { moveCursor($(this)); _evt.preventDefault(); return false; });

	// Menu options
	$("menu .button").click(function () { setOption($(this)); });

	// Window resize
	$(window).resize(onResize);
	onResize();





	/*
	 * Expose public methods
	 *
	 */

	return {

		loadJson : loadJson

	}

}





$(function () {

	var app = new RapidJsonApp("#json");

		app.loadJson(jsonData);

				
});
