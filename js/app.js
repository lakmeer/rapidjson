
var App = function () {


	//
	// PROPERTIES
	//

	// UI Components
	var $json	= $("#json .editor"),	// Main JSON editor
		$cli	= $("#console"),		// Command line entry box
		$info	= $("#info");			// Info panel


	// App components
	var components = {

		cursor		: null,
		interface	: null,
		handler		: null,
		console		: null,
		keyboard	: null

	};

	// App configuration
	var config = {

		showInfo	: true			// show info sidepanel

	}

	// Pointer into the node tree 
	var rootNode = new RootNode({});

	


	// 
	// METHODS
	//

	function init () {

		// Initialise components
		components.cursor		= new Cursor	(rootNode);
		components.interface	= new Interface	(components.cursor);
		components.handler		= new Handler	(components.interface);

		components.console		= new Console	($cli);
		components.keyboard		= new Keyboard	();

		$(window).trigger('resize');

	}

	function load (_data) {

		var json;

		// Interpret data
		try {

			json = JSON.parse(_data);

		} catch (_ex) {

			showDialog({ type : 'info', title : "Invalid", message : "JSON didn't parse" });
			return;

		}

		var newRoot = new RootNode (json);

		components.cursor.reset(newRoot);
		rootNode = newRoot;

		$json.html('');
		$json.append(newRoot.dom);

	}

	function paste () {

		// TODO : do you want to save ...? 

		function yes () {

			// Save ...
			
			no();

		}

		function no () {

			showDialog({
				type  : 'json',
				title : 'Paste your JSON text here'
			}, function (_res) {

				load(_res);

			});

		}

		no();

	}


	function save () {

		var treeData = rootNode.raw();

		showDialog({ 
			type : 'json', 
			message : "JSON STRING DATA", 
			text : JSON.stringify(treeData, null, 2) 
		}, function (_res) {});


	}

	function clear () {

		load({});

	}


	function showDialog (_config, _submit) {

		components.keyboard.pause();

		var d = new Dialog(_config, function (_r) {

			components.keyboard.resume();

			if (typeof _r === 'undefined') { return false; }

			_submit(_r);

		});

	}

	function showInfoPane (_id) {

		components.console.flash("Info panel -> '" + _id + "'", 'green', 2000);

		$info.find('.show').removeClass('show');
		$info.find("#" + _id).addClass('show');

	}


	function issueCommand (_cmdString) {

		// Send comand to CLI for parsing

	}


	//
	// LISTENERS
	//

	/*
	 * onResize
	 *
	 */

	$(window).resize(function () {

		// Window width
		var ww = 0,
			wh = 0;

		// Gutter width
		var gutterWidth	= 20;

		// Calculate total gutter width
		function calculateGutters () {

			return (2 * gutterWidth) + (0) + (0);

		}

		// Calculate component
		function handleResize () {

			// Get new window width
			ww = $(window).width() - calculateGutters();
			wh = $(window).height();

			var $editor = $json.parent();

			// All panels
			if (config.showInfo)  { 

				// Do sidebar
				$info.width ( Math.round(ww / 3 - $info.paddingX() - gutterWidth));
				$info.height( Math.round(wh - 150));

				// Center gets 2/3
				$editor.width ( Math.round((2 * ww / 3) - $editor.paddingX() ));

			// No panels
			} else {

				$editor.width( ww - $editor.paddingX() );

			}
			
			$editor.height( Math.round(wh - 150));

		}

		return handleResize

	}());


	/*
	 * Json region clicked
	 *
	 */

	$json.click(function (_event) {

		var $this = $(_event.target);

		// If this is the JSON field itself, select all
		if ($this.attr('id') === 'json') { $this = rootNode.dom; }

		// If user has clicked inside a node, go to node itself (it's parent, dom-wise)
		if (!$this.hasClass('node')) { $this = $this.parent('.node'); }

		// Move cursor to destination
		// TODO: Change this to route via CLI
		components.cursor.moveTo($this.data('json_node'));
	
	});



	/*
	 * Listen for keyboard Commands
	 *
	 */

	document.addEventListener('keyboard', function (_event) {

		// Get command from key combination
		var thisCommand = components.handler.interpretKey(_event.keys);

		// console.log(" >> " + _event.keys + " -> " + thisCommand.name);

		components.interface.do(thisCommand);

	});








	//
	// EXPORT PHASE
	//

	return {

		init	: init,
		cmd		: issueCommand,

		ui		: {

			showDialog : showDialog

		},

		file	: {

			load  : load,
			save  : save,
			paste : paste,
			clear : clear,
			info  : showInfoPane

		},

		console	: {

			error : function (_msg) { components.console.flash(_msg, 'red',   2000); },
			log   : function (_msg) { components.console.flash(_msg, 'blue',  2000); },
			ok    : function (_msg) { components.console.flash(_msg, 'green', 2000); },
			read  : function (_fn)  { components.console.read(_fn); }

		},

		keyboard : {
		   
		   pause	: function () { components.keyboard.pause();  },
		   resume	: function () { components.keyboard.resume(); }

		}

	}

}();
