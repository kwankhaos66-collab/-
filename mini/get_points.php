<?php
include 'db.php';

$sql = "SELECT id, name, description, ST_X(geom) AS lon, ST_Y(geom) AS lat FROM points";
$stmt = $pdo->query($sql);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($result);
?>
