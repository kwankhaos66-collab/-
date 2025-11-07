<?php
$host = "localhost";
$dbname = "mini";
$user = "postgres";
$pass = "preem2546"; // แก้เป็นรหัสของคุณ

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage();
    exit;
}
?>
