<?php
// db.php - Database connection for Duka Bora
// Update these values to match your phpMyAdmin / XAMPP MySQL setup
$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";
$DB_NAME = "dukabora"; // change to your existing database name if different

$conn = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$schema_check = mysqli_query($conn, "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'seller_id'");
if ($schema_check) {
    $row = mysqli_fetch_assoc($schema_check);
    if (!isset($row['cnt']) || (int)$row['cnt'] === 0) {
        mysqli_query($conn, "ALTER TABLE products ADD COLUMN seller_id INT NOT NULL DEFAULT 0 AFTER stock_quantity");
    }
    mysqli_free_result($schema_check);
}
?>
