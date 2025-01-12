<?php
    $rootDir = realpath($_SERVER["DOCUMENT_ROOT"]);
    $log = fopen($rootDir . '/logs/middlewares.txt', 'a');
    fwrite($log, date('Y-m-d H:i:s') . ' - ' . $_SERVER['REQUEST_URI']  . $_SERVER['HTTP_USER_AGENT'] . ' - ' . json_encode($_POST) . ' - ' . json_encode($_FILES) . "\n");
    fclose($log);
?>