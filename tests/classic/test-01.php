<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classic Test Case 01 - BXSS Playground</title>
</head>
<body>
    <h3>Query Parameters</h3>
    <a href="test-01.php?name=John">QPara 01</a> <br>
    <a href="/classic/test-01.php?name=Jane&age=23">QPara 02</a> <br>
    <a href="?relative=1">QPara 03</a> <br>

<br><h4>Results:</h4>
<pre><code>
<?php
    print_r($_GET);
?>
</code></pre>

    <br><br><hr><br><a href="../">Go Back</a> <br>
</body>
</html>