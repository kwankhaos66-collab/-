<?php
$geoserver_url = "http://localhost:8080/geoserver/geo42/ows?"
    . "service=WFS&version=1.0.0&request=GetFeature"
    . "&typeName=agi_students:final_NRF_all_1221_620108"
    . "&outputFormat=application/json"
    . "&srsName=EPSG:4326"; // ✅ ให้ GeoServer แปลงเป็นพิกัดละติจูด/ลองจิจูด

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $geoserver_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
?>

