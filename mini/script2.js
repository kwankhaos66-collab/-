// ==========================
// สร้างแผนที่
const map = L.map("map").setView([16.5, 100.5], 8);

// BaseMap
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
const satellite = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "Google Satellite",
  }
);

const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution:
    "Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap",
});

// ==========================
// GeoJSON
function popUp(f, l) {
  var out = [];
  if (f.properties) {
    for (key in f.properties) {
      out.push(key + ": " + f.properties[key]);
    }
    l.bindPopup(out.join("<br />"));
  }
}
var ThaiProvJSON = new L.GeoJSON.AJAX(["./thailand_province.geojson"], {
  onEachFeature: popUp,
});
// ==========================
// LayerGroup สำหรับฝน
const rainLayer = L.layerGroup();

async function loadRainData() {
  try {
    const url =
      "https://api-v3.thaiwater.net/api/v1/thaiwater30/public/thailand_main_rain?province_code=65";
    const response = await axios.get(url);
    const data = response.data.data;

    // icon เดียวสำหรับฝน
    const rainIcon = L.icon({
      iconUrl: "rain.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    data.forEach((item) => {
      const lat = item.station.tele_station_lat;
      const lon = item.station.tele_station_long;
      const name = item.station.tele_station_name.th;
      const rain = item.rain_24h ?? 0;
      const time = item.rainfall_datetime;
      const province = item.geocode.province_name.th;

      const marker = L.marker([lat, lon], { icon: rainIcon }).bindPopup(`
        <b>${name}</b><br>
         ปริมาณฝน 24 ชม.: <b>${rain} มม.</b><br>
         เวลา: ${time}<br>
         จังหวัด: ${province}
      `);

      marker.addTo(rainLayer);
    });
  } catch (error) {
    console.error(error);
  }
}
loadRainData();

// ==========================
// LayerGroup สำหรับระดับน้ำ
const waterLayer = L.layerGroup();

async function loadWaterData() {
  try {
    const url =
      "https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load";
    const response = await axios.get(url);
    const data = response.data.waterlevel_data.data;

    // icon เดียวสำหรับน้ำ
    const waterIcon = L.icon({
      iconUrl: "ระดับน้ำ.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    data.forEach((item) => {
      const lat = item.station.tele_station_lat;
      const lon = item.station.tele_station_long;
      const name = item.station.tele_station_name.th;
      const level = item.waterlevel_msl ?? "ไม่มีข้อมูล";
      const diff = item.diff_wl_bank ?? "-";
      const river = item.river_name ?? "-";

      const marker = L.marker([lat, lon], { icon: waterIcon }).bindPopup(`
        <b>${name}</b><br>
         ระดับน้ำ (MSL): <b>${level} ม.</b><br>
         แม่น้ำ/คลอง: ${river}<br>
         เวลา: ${item.waterlevel_datetime}
      `);

      marker.addTo(waterLayer);
    });
  } catch (error) {
    console.error(error);
  }
}
loadWaterData();


///ข้อมูลจาก geoserver ////
    var road = L.tileLayer.wms(
      "http://localhost:8080/geoserver/ne/wms?",
      {
        layers: "ne:road",
        format: "image/png",
        transparent: true,
      }
    );

    var district = L.tileLayer.wms(
      "http://localhost:8080/geoserver/geo42/wms?",
      {
        layers: "geo42:district",
        format: "image/png",
        transparent: true,
      }
    );

    var gcpPing_pong = L.tileLayer.wms(
      "http://localhost:8080/geoserver/geo42/wms?",
      {
        layers: "gcp:gcpPing_pong",
        format: "image/png",
        transparent: true,
      }
    );
      var plk_pop = L.tileLayer.wms(
      "http://localhost:8080/geoserver/geo42/wms?",
      {
        layers: "geo42:plk_pop",
        format: "image/png",
        transparent: true,
      }
    );
    
  //   let geoLayer; // ✅ ประกาศไว้ก่อน

  // // ดึงข้อมูลจาก PHP Proxy
  // fetch("get_wfs.php")
  //   .then(res => res.json())
  //   .then(data => {
  //     geoLayer = L.geoJSON(data, {
  //       style: { color: "blue", weight: 2, fillOpacity: 0.3 },
  //       onEachFeature: (feature, layer) => {
  //         const props = feature.properties;
  //         let popup = "";
  //         for (const key in props) {
  //           popup += `<b>${key}</b>: ${props[key]}<br>`;
  //         }
  //         layer.bindPopup(popup);
  //       }
  //     });
  //     map.fitBounds(geoLayer.getBounds());
  //   })
  //   .catch(err => console.error("โหลดข้อมูล WFS ไม่ได้:", err));

// ==========================
// LayerGroup สำหรับเครื่องซักผ้า
const washingMachineLayer = L.layerGroup();

// ข้อมูล GeoJSON ร้านค้า
const washingMachineData = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "Id": 1, "Name ": "KOR SAK NOI " }, "geometry": { "coordinates": [ 100.19735192692815, 16.757314583235896 ], "type": "Point" }, "id": 0 },
    { "type": "Feature", "properties": { "Id": 2, "Name ": "เครื่องซักผ้าหยอดเหรียญและน้ำดื่ม" }, "geometry": { "coordinates": [ 100.19749516263897, 16.756788601895067 ], "type": "Point" }, "id": 1 },
    { "type": "Feature", "properties": { "Id ": 3, "Name ": "WashXpress เคียงมอ" }, "geometry": { "coordinates": [ 100.19364163439167, 16.756258285111784 ], "type": "Point" }, "id": 2 },
    { "type": "Feature", "properties": { "Id ": 4, "Name ": "DRAGON WASH AND DRY" }, "geometry": { "coordinates": [ 100.19464695312962, 16.754848638176398 ], "type": "Point" }, "id": 3 },
    { "type": "Feature", "properties": { "Id": 5, "Name ": "MH mikku" }, "geometry": { "coordinates": [ 100.19486728268345, 16.753654835516713 ], "type": "Point" }, "id": 4 },
    { "type": "Feature", "properties": { "Id ": 6, "Name ": "Kolae สาขา ม.นเรศวร2 ( แสงพรหมแลนด์1)" }, "geometry": { "coordinates": [ 100.19458787457717, 16.753247822122447 ], "type": "Point" }, "id": 5 },
    { "type": "Feature", "properties": { "Id": "ร้านสะดวกซัก WASHENJOY" }, "geometry": { "coordinates": [ 100.19511659392361, 16.752883226504977 ], "type": "Point" }, "id": 6 },
    { "type": "Feature", "properties": { "Id ": 7, "Name ": "Otteri WASH&DRY" }, "geometry": { "coordinates": [ 100.19675795642053, 16.753652079486614 ], "type": "Point" }, "id": 7 },
    { "type": "Feature", "properties": { "Id ": 8, "Name ": "PB WASH" }, "geometry": { "coordinates": [ 100.19707123024563, 16.751007558316346 ], "type": "Point" }, "id": 8 },
    { "type": "Feature", "properties": { "Id ": 9, "Name ": "Sunshine wash " }, "geometry": { "coordinates": [ 100.19708591603211, 16.74965002186474 ], "type": "Point" }, "id": 9 },
    { "type": "Feature", "properties": { "Id ": 10, "Name ": "Tanjai wash&dry " }, "geometry": { "coordinates": [ 100.19779638166926, 16.74815727352241 ], "type": "Point" }, "id": 10 },
    { "type": "Feature", "properties": { "Id ": 11, "Name ": "ร้านซักอบรีด-อ้อมจัง" }, "geometry": { "coordinates": [ 100.20091236338561, 16.749550904703298 ], "type": "Point" }, "id": 11 },
    { "type": "Feature", "properties": { "Id": 12, "Name ": "kolae wash & dry สาขา ม.นเรศวร" }, "geometry": { "coordinates": [ 100.20146196110056, 16.749872676788385 ], "type": "Point" }, "id": 12 },
    { "type": "Feature", "properties": { "Id ": 13, "Name ": "พี่แกะ ซักอบรีด" }, "geometry": { "coordinates": [ 100.20157451352401, 16.74994536385988 ], "type": "Point" }, "id": 13 },
    { "type": "Feature", "properties": { "Id ": 14, "Name ": "Seal Wash & Dry สาขาม.นเรศวร" }, "geometry": { "coordinates": [ 100.20126669808798, 16.75017883927849 ], "type": "Point" }, "id": 14 },
    { "type": "Feature", "properties": { "Id ": "15 ", "Name ": "Seal Wash & Dry สาขาม.นเรศวร" }, "geometry": { "coordinates": [ 100.19979054062958, 16.750818046325335 ], "type": "Point" }, "id": 15 },
    { "type": "Feature", "properties": { "Id ": "15 ", "Name ": "Mother Swash" }, "geometry": { "coordinates": [ 100.20045316158479, 16.752876015892497 ], "type": "Point" }, "id": 16 },
    { "type": "Feature", "properties": { "Id ": 16, "Name ": "Clean Pro Express, Naresuan พิษณุโลก" }, "geometry": { "coordinates": [ 100.19885458369856, 16.75390214479171 ], "type": "Point" }, "id": 17 },
    { "type": "Feature", "properties": { "Id ": 16, "Name ": "ร้านโดนัทซักรีด (ซัก อบ รีด)" }, "geometry": { "coordinates": [ 100.19156399019107, 16.75570631157538 ], "type": "Point" }, "id": 18 },
    { "type": "Feature", "properties": { "Id ": 17, "Name ": "Code Clean สาขา ม.นเรศวร" }, "geometry": { "coordinates": [ 100.19123783094881, 16.751773203841964 ], "type": "Point" }, "id": 19 }
  ]
};

// Icon สำหรับเครื่องซักผ้า
const washingMachineIcon = L.icon({
  iconUrl: "washing-machine.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// เพิ่มข้อมูลเครื่องซักผ้าลงใน layer
washingMachineData.features.forEach((feature) => {
  const [lng, lat] = feature.geometry.coordinates;
  const props = feature.properties;
  
  // สร้าง popup content
  let popupContent = "<b>ร้านซักผ้า</b><br>";
  if (props["Id"]) {
    popupContent += `<b>ID:</b> ${props["Id"]}<br>`;
  }
  if (props["Name "]) {
    popupContent += `<b>ชื่อ:</b> ${props["Name "]}<br>`;
  }
  // เพิ่มข้อมูลอื่นๆ ถ้ามี
  for (const key in props) {
    if (key !== "Id" && key !== "Name ") {
      popupContent += `<b>${key}:</b> ${props[key]}<br>`;
    }
  }
  
  const marker = L.marker([lat, lng], { icon: washingMachineIcon })
    .bindPopup(popupContent);
  
  washingMachineLayer.addLayer(marker);
});

// ==========================
// Layer Control
const baseMaps = {
  OSM: osm,
  Satellite: satellite,
  Terrain: topo,
};
const overlayMaps = {
  "ฝน (API)": rainLayer,
  "ระดับน้ำในประเทศไทย (API)": waterLayer,
  "ขอบเขตจังหวัดในประเทศไทย (GeoJSON)": ThaiProvJSON,
  "ถนนในจังหวัดอุตรดิตถ์": road,
  "ขอบเขตอำเภอในจังหวัดอุตรดิตถ์": district,
  "gcp": gcpPing_pong,   
  "ขอบเขตอำเภอในจังหวัดพิษณุโลก": plk_pop,
  "ร้านซักผ้า": washingMachineLayer,
};
// ✅ เก็บ Layer Control ไว้ในตัวแปร
const layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: true }).addTo(map);

// ==========================
// ดึงข้อมูลจาก PHP Proxy (WFS)
fetch("get_wfs.php")
  .then(res => res.json())
  .then(data => {
    // สร้าง geoLayer หลังโหลดเสร็จ
    const geoLayer = L.geoJSON(data, {
      style: { color: "blue", weight: 2, fillOpacity: 0.3 },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        let popup = "";
        for (const key in props) {
          popup += `<b>${key}</b>: ${props[key]}<br>`;
        }
        layer.bindPopup(popup);
      }
    });

    // ✅ เพิ่ม layer นี้เข้ากับ Layer Control หลังโหลดเสร็จ
    layerControl.addOverlay(geoLayer, "ป่าสงวนแห่งชาติ (GeoServer WFS)");
  })
  .catch(err => console.error("โหลดข้อมูล WFS ไม่ได้:", err));