Time Sink
---------
This is a web visualizer for [Time Sink](http://manytricks.com/timesink/).

How to Use
----------
### Export Setup
This visualizer expects the exported snapshot to contain the Application and Foreground data. These must be selected in Time Sink's preferences.

Due to the way Time Sink exports window data, windows cannot be included in the export (yet).

Also set the column separator to be the comma.

### Visualizer Setup
Set the path in main.js:61 to be the path to your exported csv snapshot.

Once this is done, you must access index.html through a server due to security restrictions in browsers.