<?php
include_once('_init.php');
$db = DB_SQLite::get();
$configArr = $db->getEntries('ConfigMain', 'Main');
$config = array_pop($configArr)->data;
$foregroundColor = $config->logo->foregroundColor ?? '#FFCA34';
$backgroundColor = $config->logo->backgroundColor ?? '#9146FF';

$logo = file_get_contents('../app/htdocs/media/actionbot_eye.svg');
$logo = preg_replace('/#ffffff/U', $foregroundColor, $logo);
header('Content-Type: image/svg+xml');
echo $logo;