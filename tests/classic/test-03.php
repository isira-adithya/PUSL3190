<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classic Test Case 03 - BXSS Playground</title>
</head>
<body>
    <h3>Classic File Uploads</h3>
    
    <form action="/classic/test-03.php" method="POST" enctype="multipart/form-data">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name"> <br>
        <input type="file" name="file" accept="image/png"> <br>
        <button type="submit">Submit</button>
    </form>

    <br>

<br><h4>Results:</h4>
<pre><code>
<?php
    echo "POST: ";
    print_r($_POST);

    echo "\n\n\nFILES: ";
    print_r($_FILES);
?>
</code></pre>

    <br><br><hr><br><a href="../">Go Back</a>
</body>
</html>