Getting Started for developers working directly on itemMirror
==========

##Build Order:
Use require.js optimizer to compile everything from \scripts\* into \build\
use r.js.cmd -o config\dev.build.js or pro.build.js

from node.js command prompt

- pro.build uses uglify to minify the file
- dev.build uses standard appending to build

##The Drivers:
In \scripts\* you should find the following javascript files.

###ItemMirror.js
The main file. It loads all of the drivers as dependencies.
It relies mainly on prototypal methods that access its hidden classes (prepended with underscore) and have methods that build off its various drivers.

###FragmentDriver.js
Driver that handles writing to and reading from the XooML fragment. 

###ItemDriver.js
Driver that handles writing to and reading from the Data Storage Space.

###PathDriver.js
Provides functions for routing to paths in the Data Storage Space
[This should eventualy be integrated into the itemDriver]

###SyncDriver.js
Provides functions for syncing between Storage space and XooML

###XooMLDriver.js
Driver that manages where the XooMLFragment is kept.

###XooMLUtil.js

###XooMLConfig.js

###XooMLExceptions.js

##Documentation building via yuidoc

- yuidoc -c config\yuidoc.json
- yuidoc -c config\yuidoc-core.json

This compiles both \documentation\ and \documentation-core\

Documentation has only comments on \scripts\ItemMirror.js. Documentation-Core has comments from everything in \scripts\

