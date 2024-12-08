# Fix

## Primary Priority
These are things that needs to be fixed before the project structure can function at all.

1. Work away all references to things in `./bot` from everything in `./lib`. This is a cascading problem that might seem near impossible to fix, but with bravery and effort it should work out.
   * Replace some class references with matching interfaces so we don't import all bot code when we don't need to.
   * Move some interfaces and/or enums into `./lib/Types`.
   * Move some utility functions or even classes into `./lib`.
2. Check if the Vue language server can do type references to an external folder yet. 

## Secondary Priority
Things that needs to be set up before there can be any major progression in getting it working again.

1. 🆗 Port database handler to runtime
2. Implement a WebSocket server that handles database and presenter requests
3.  