<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$name = $data["name"];
$desc = $data["description"];
$lat = $data["lat"];
$lon = $data["lon"];

$sql = "INSERT INTO points (name, description, geom)
        VALUES (:name, :description, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":name" => $name,
    ":description" => $desc,
    ":lat" => $lat,
    ":lon" => $lon
]);

echo json_encode(["status" => "success"]);
?>
