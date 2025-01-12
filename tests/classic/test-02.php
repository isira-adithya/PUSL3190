<?php include '../middlewares/logger.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classic Test Case 02 - BXSS Playground</title>
</head>
<body>
    <h3>Classic Forms</h3>
    
    <h5>Enc Type: <i>application/x-www-form-urlencoded</i></h5>
    <form action="/classic/test-02.php" method="POST" enctype="application/x-www-form-urlencoded">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name"> <br>
        <label for="message">Message:</label> <br>
        <textarea name="message" id="message" cols="30" rows="10"></textarea> <br>
        <button type="submit">Submit</button>
    </form>

    <br>

    <h5>Enc Type: <i>multipart/form-data</i></h5>
    <form action="/classic/test-02.php" method="POST" enctype="multipart/form-data">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name"> <br>
        <label for="message">Message:</label> <br>
        <textarea name="message" id="message" cols="30" rows="10"></textarea> <br>
        <button type="submit">Submit</button>
    </form>

<br><h4>Results:</h4>
<pre><code>
<?php
    print_r($_POST);
?>
</code></pre>

    <br><br><hr><br><a href="../">Go Back</a>
</body>
</html>