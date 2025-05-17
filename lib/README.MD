# Library
This code is shared between the Server and Client, meaning it runs both in the standalone runtime as well as browsers.
## Categories
* Objects `Classes that used to stored in the database and and to run the bot.`
  * Data `Root objects that are both data classes that are JSON-encoded into the DB and contain stubs to code that can be run by the bot.`
  * Options `Classes that emulate Enums but are classes that can be stored in the database.`
* SharedConstants `Static value references.`
* SharedUtils `Git submodule with cross-platform code that is also used in other projects.`
* Types `General interfaces.`