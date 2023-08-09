<?php
include_once('_init.php');

$db = DB::get();

try {
    // https://www.sqlite.org/foreignkeys.html
    $sql = new SQLite3('_db/test.sqlite');
} catch (Exception $exception) {
    echo "<p>The extension might not be available, make sure to uncomment: <code>extension=sqlite3</code> in <code>php.ini</code> and restart Apache.</p>";
    die("<p>".$exception->getMessage()."</p>");
}
/*
TODO
    Figure out how to replicate the current table, if possible.
    1. What time format to use, seems TEXT with YYYY-MM-DD HH:MM:SS is the most common way.
    2. How to handle setting the time, a default exists, but onupdate? Are there triggers?
    3. How to do the group unique constraint with group_class and group_key?
    4. How to do the parent_id foreign key constraint med delete coalesce?
 */
$sql->exec("PRAGMA foreign_keys = ON;");
$sql->exec("
CREATE TABLE IF NOT EXISTS json_store (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  row_created TEXT NOT NULL DEFAULT (datetime('now')),
  row_modified TEXT NOT NULL DEFAULT (datetime('now')),
  group_class TEXT NOT NULL,
  group_key TEXT NOT NULL,
  parent_id INTEGER,
  data_json TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES json_store (row_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_group ON json_store (group_class, group_key);
CREATE INDEX IF NOT EXISTS parent_id_index ON json_store (parent_id);
CREATE TRIGGER IF NOT EXISTS update_row_modified
AFTER UPDATE ON json_store
FOR EACH ROW
BEGIN
  UPDATE json_store SET row_modified = datetime('now') WHERE row_id = NEW.row_id;
END;
");
echo "<pre>";
$allRows = $db->query("SELECT * FROM json_store;");
foreach($allRows as $row) {
    try {
        $stmt = $sql->prepare('INSERT INTO json_store VALUES (:row_id,:row_created,:row_modified,:group_class,:group_key,:parent_id,:data_json);');
        $stmt->bindValue(':row_id', $row['row_id'], SQLITE3_INTEGER);
        $stmt->bindValue(':row_created', $row['row_created']);
        $stmt->bindValue(':row_modified', $row['row_modified']);
        $stmt->bindValue(':group_class', $row['group_class']);
        $stmt->bindValue(':group_key', $row['group_key']);
        $stmt->bindValue(':parent_id', $row['parent_id'], SQLITE3_INTEGER);
        $stmt->bindValue(':data_json', $row['data_json']);
        $result = $stmt->execute();
    } catch (Exception $exception) {
        echo "<p>".$exception->getMessage()."</p>";
    }
}
$ok = $sql->exec("SELECT * FROM json_store;");