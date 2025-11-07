<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];

$sql = "DELETE FROM points WHERE id = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute([":id" => $id]);

echo json_encode(["status" => "deleted"]);
?>
