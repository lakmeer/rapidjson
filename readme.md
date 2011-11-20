# Rapid JSON

Rapid Json is a tool for _fast_ authoring or editing of heirarchical data. Before you start, you 
should have read up on the JSON spec at json.org. It's creation is motivated because plain-text 
editing of XML or JSON structures is tedious and painful, and existing editors are slow, mouse-heavy 
or clunky to use. This tool aims to be slick, fast, and flexible, to make working with heirarchical 
data fun and fluid. This tool is pre-alpha; I would love bug reports, missing features, oversights,
pull requests, ideas, feedback and criticism - please lodge such at this project's Github page.



###	How do I use it?

Until the command-line is implemented, interface with your data with keyboard hotkeys. 
Here are some basics to get you started. Try them out on the sample data in the editor.  

* Up/Down    : move cursor up and down
* Left/Right : move cursor parent/child
* Enter	   	 : change node value
* Tab		 : change node name
* Ctrl-Enter : add child to this node
* Space      : fold
 
* Ctrl-N     : clear all data and start fresh
* Ctrl-O     : paste some JSON to load into the editor
* Crtl-S     : export your editor data as a JSON string

* Hit <strong>Ctrl-K</strong> for the full list.
* Hit <strong>Ctrl-H</strong> at any time to get this help text back.


### Future Development

Although this tool is called Rapid 'JSON', it is intended that is may be used to create generic 
heirarchical data. As such, in future is will have export modes for XML, YAML, and as many common 
formats of heirarchical data as I can manage.

Next to be implemented are:

* Copy &amp; Paste
* Undo, redo and repeat
* Node swap
* Templating
	
See Development Map panel for more info (Ctrl-D).

### Things to know

Styles are currently only configured for Webkit. Firefox coming shortly. 
Most of the code still generates a lot of debug output as console calls, 
so if it's not working try running it with your console open so they don't
get suppressed.
					
Also, when adding nodes or editing values you can type any valid JSON construct 
and the app will interpret it for you. Try selecting a node, editing by pressing 
Enter, and pasting _*{ "thousand" : 1000, "million" : 1000000 }*_ to see this working.


#### Tips for more advanced stuff

*Shift-Tilde* to switch true/false and string/number
Jump straight to the root with *Ctrl-Shift-Left*
Force string input by leading with a double-quote (")
You can use floating point scientific number notation (1e+23, etc)
*Number keys* skip to _nth_ sibling. Hold *shift* for _nth_ child.
					
						
##### Happy Hacking
