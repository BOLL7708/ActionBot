<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>The Editor</h2>
            <p>The idea is for this page to be able to edit anything that is in the database.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/EditorEmbed.js"></script>
<?php
PageUtils::printBottom();
?>