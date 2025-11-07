<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];
$name = $data["name"];
$desc = $data["description"];
$lat = $data["lat"];
$lon = $data["lon"];

$sql = "UPDATE points
        SET name = :name, description = :description, geom = ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
        WHERE id = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":name" => $name,
    ":description" => $desc,
    ":lat" => $lat,
    ":lon" => $lon,
    ":id" => $id
]);

echo json_encode(["status" => "updated"]);
?>
