<?php
// Init
include_once '_init.php';
$db = DB::get();

// Auth
Utils::checkAuth();

// Test
$method = strtolower($_SERVER['REQUEST_METHOD']);
if($method === 'head') {
    $ok = $db->test();
    http_response_code($ok ? 200 : 400);
    exit;
}

function getHeaderValue(string $field): string|null {
    $headers = getallheaders();
    return $headers[$field] ?? $headers[strtolower($field)] ?? null;
}

// Parameters
$groupClass = getHeaderValue('X-Group-Class');
if($method !== 'get' && !$groupClass) {
    Utils::exitWithError('X-Group-Class is required in header when not using GET', 2004);
}
$groupKey = getHeaderValue('X-Group-Key');
$rowIds = array_filter(explode(',', getHeaderValue('X-Row-Ids') ?? ''));
$dataJson = file_get_contents('php://input'); // Raw JSON as a string.
$newGroupKey = getHeaderValue('X-New-Group-Key');
$rowIdList = !!getHeaderValue('X-Row-Id-List');
$rowIdLabel = getHeaderValue('X-Row-Id-Label');
$rowIdClasses = getHeaderValue('X-Row-Id-Classes');
$returnId = !!getHeaderValue('X-Return-Id');

// Execute
$output = null;
switch($method) {
    case 'post':
        $updatedKey = false;
        if($groupKey !== null && $newGroupKey !== null) { // Edit key
            $updatedKey = $db->updateKey($groupClass, $groupKey, $newGroupKey);
            $groupKey = $newGroupKey;
        }
        if($groupKey === null && $newGroupKey !== null) { // New key
            $groupKey = $newGroupKey;
        }
        $result = $db->saveEntry( // Insert or update data
            $groupClass,
            $groupKey,
            $dataJson
        );
        $output = $result !== false ? ['result'=>true, 'groupKey'=>$result] : false;
        break;
    case 'delete':
        $output = $db->deleteSetting(
            $groupClass,
            $groupKey
        );
        break;
    default: // GET, etc
        if($returnId) {
            // Only return the ID for this row
            $output = $db->getRowId($groupClass, $groupKey);
        }
        elseif($rowIdList) {
            // Only row IDs with labels
            $output = $db->getRowIdsWithLabels($groupClass, $rowIdLabel);
        }
        elseif($rowIdClasses) {
            // Only class references based on IDs
            if($rowIds && count($rowIds) > 0) $output = $db->getClassesByIds($rowIds);
            else $output = new stdClass();
        }
        elseif($rowIds && count($rowIds) > 0) {
            // Full data entries based on IDs
            $output = $db->getEntriesByIds($rowIds);
        }
        elseif(!$groupClass || str_contains($groupClass, '*')) {
            // Only classes with counts
            $output = $db->getClassesWithCounts($groupClass);
        }
        elseif($groupKey) {
            // Single entry based on key
            $output = $db->getEntries($groupClass, $groupKey);
            $array = is_object($output) ? get_object_vars($output) : $output;
            $output = array_pop($array);
        } else {
            // All entries for a group
            $output = $db->getEntries($groupClass);
        }
        break;
}

// Output
$db->output($output);