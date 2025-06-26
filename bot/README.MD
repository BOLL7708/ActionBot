# Bot

## Source Folders

Short descriptions of what the different folders are supposed to contain.

### Classes

Things I couldn't put in any other bucket.

### Constants

Will contain a collection of static values that are meant to be accessed and not changed.

### Helpers

Static methods like Utils, but that make use of external data sources to give a result.

### Interfaces

General interfaces that are used all over the place.

### Runners

Extensions of prototypes of various classes so they contain code even if they can be exported for the browser.

### Singletons

Will provide a single static instance regardless of where it is called.

### Utils

Static methods that will perform the same action always, depending on input.

## Database Mechanism

1. DatabaseSingleton
    * It's a singleton that provides a single instance of the database connection.
    * It is used to connect to the database and perform queries, as well as close the connection.
    * It creates the database with table(s) if needed.
2. DatabaseHelper
    * Contains all the queries that are used to interact with the database.
3. AbstractItem
    * This is the base class for all data objects that are stored in the database.
    * It includes methods to re-instantiate classes from the class name and a JSON string.
4. AbstractDataRunner
    * Contains the actual re-instantiation code, separated out due to being bot-only-code.