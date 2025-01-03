<?php
function printMenuItem(string $thisScript, $newGroup, string $file, string $label, string $title, bool $blank=false, bool $isWIP=false): void {
    $thisGroup = Utils::getQueryParams($file)['g'] ?? '';
    $newScript = explode('.', $file)[0];
    $isCurrent = (
            $thisScript == $newScript
            && $thisGroup == $newGroup
    ) ? 'class="menu-bar-current"' : '';
    $openInBlank = $blank ? 'target="_blank"' : '';
    $class = $isWIP ? 'class="wip"' : '';
    if($isWIP) $title = "(Work in progress) $title";
    echo "<li $class><a href=\"$file\" title=\"$title\" $isCurrent $openInBlank>$label</a></li>";
}
?>
<div id="menu-bar" class="hbar">
    <a href="https://actionbot.app" target="_blank" title="Open the ActionBot official website." class="version">
        <img id="corner-logo" src="_logo.php" alt="ActionBot Logo" />
        <br/>
        <?=Utils::getVersion()?>
    </a>
    <ul>
        <?php
        $scriptFile = Utils::getScriptFileName();
        $group = Utils::getQueryParams()['g'] ?? '';

        if($scriptFile === 'index') {
            printMenuItem($scriptFile,$group, 'index.php', '🧪 Setup', 'Run the setup.');
        } else {
            printMenuItem($scriptFile, $group, 'editor.php?g=c', '🎨 Config', 'Browse, add, edit or delete configs.');
            printMenuItem($scriptFile, $group, 'editor.php?g=p', '🧩 Presets', 'Browse, add, edit or delete presets.');
            printMenuItem($scriptFile, $group, 'editor.php?g=e', '🎉 Events', 'Browse, add, edit or delete events.');
            printMenuItem($scriptFile, $group, 'editor.php?g=t', '⏰ Triggers', 'Browse, add, edit or delete triggers.');
            printMenuItem($scriptFile, $group, 'editor.php?g=a', '🤹 Actions', 'Browse, add, edit or delete actions.');
            printMenuItem($scriptFile, $group, 'editor.php?g=s', '📚 Settings', 'Browse, add, edit or delete settings.');
            printMenuItem($scriptFile, $group, 'dashboard.php', '🚦 Dashboard', 'Show the dashboard which lets you manage events and features live.', false, true);
            printMenuItem($scriptFile, $group, 'tools.php', '🧰 Tools', 'Run various batch jobs to import data from external sources, etc.');
            printMenuItem($scriptFile, $group, 'defaults.php', '🍰 Defaults', 'Import various default commands, rewards, etc.');
            printMenuItem($scriptFile, $group, 'search.php', '🔭 Search', 'Search for items in the database.', false, true);
            printMenuItem($scriptFile, $group, 'help.php', '🤖 Help', 'Access additional help documentation.', false, true);
            printMenuItem($scriptFile, $group, 'widget.php', '🎭 Widget (new tab)', 'This opens the widget in a new tab, use this as a browser source in your streaming application.', true);
        }
        // This is not really preferred as it will not get referenced when changing the
        // data object class in TS, but to make the interface not jump we load this here.
        $db = DB_SQLite::get();
        $showFavorites = false;
        if(!str_ends_with($_SERVER['SCRIPT_NAME'], 'index.php')) {
            $entries = $db->getEntries('ConfigEditor', 'Main') ?? [];
            $config = array_shift($entries);
            $showFavorites = $config->data->showFavoritesBar ?? true;
        }
        $favoritesBarStyle = !$showFavorites ? 'style="display: none;"' : '';
        ?>
        <li><a href="index.php" id="topBarSignOutLink" title="Sign out of this page.">🔥 Sign out</a></li>
    </ul>
</div>
<?php
$fileName = pathinfo($_SERVER["SCRIPT_FILENAME"], PATHINFO_FILENAME);
if($fileName == 'editor') { ?>
<div id="favorites-bar" class="hbar" <?=$favoritesBarStyle?>><ul><li><a>⌛ Loading...</a></li></ul></div>
<?php } ?>