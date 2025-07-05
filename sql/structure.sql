/* Turn on foreign key support. */
PRAGMA foreign_keys = ON;
PRAGMA recursive_triggers = OFF;

/* Create main table with foreign key. */
CREATE TABLE IF NOT EXISTS json_store
(
    row_id       INTEGER PRIMARY KEY,
    row_created  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    row_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_class  TEXT NOT NULL,
    group_key    TEXT,
    parent_id    INTEGER,
    json_text    TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES json_store (row_id) ON DELETE CASCADE,
    CONSTRAINT chk_mex_gkey_pid
        /* If we have a parent we don't need a key, only use a key with no parent */
        CHECK ((group_key IS NOT NULL AND parent_id IS NULL)
            OR
               (group_key IS NULL AND parent_id IS NOT NULL))
);

/* Add non-primary indices. */
CREATE UNIQUE INDEX IF NOT EXISTS uidx_group ON json_store (group_class, group_key);
CREATE INDEX IF NOT EXISTS idx_parent ON json_store (parent_id);

/* Add trigger to handle modified time. */
CREATE TRIGGER IF NOT EXISTS trg_update
    AFTER UPDATE
    ON json_store
    FOR EACH ROW
BEGIN
    UPDATE json_store SET row_modified = CURRENT_TIMESTAMP WHERE row_id = NEW.row_id;
END;