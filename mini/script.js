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
// LayerGroup และ Icon
const userPointsLayer = L.layerGroup().addTo(map);

const userIcon = L.icon({
  iconUrl: "pin_1.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// ==========================
// ตัวเก็บ Marker
let userMarkers = [];

// ฟังก์ชันสร้าง popup
function updatePopup(marker, id, name, description) {
  marker.bindPopup(`
    <b>${name}</b><br>
    ${description}<br>
    <button id="delete-${id}">ลบ</button>
    <button id="edit-${id}">แก้ไข</button>
  `);

  marker.on("popupopen", function () {
    document.getElementById(`delete-${id}`).onclick = function () {
      deletePoint(id);
    };
    document.getElementById(`edit-${id}`).onclick = function () {
      editPoint(id, name, description, marker);
    };
  });
}

// ==========================
// โหลดและรีเฟรชจุดแบบ real-time
async function refreshPoints() {
  userPointsLayer.clearLayers();
  userMarkers = [];

  const res = await axios.get("./get_points.php");
  const points = res.data;

  const select = document.getElementById("searchSelect");
  select.innerHTML = '<option value="">-- เลือกจุดเพื่อค้นหา --</option>';

  points.forEach((p) => {
    const marker = L.marker([p.lat, p.lon], {
      draggable: true,
      icon: userIcon,
    });
    updatePopup(marker, p.id, p.name, p.description);

    // Drag end update
    marker.on("dragend", async function (e) {
      const { lat, lng } = e.target.getLatLng();
      await axios.post("./update_point.php", {
        id: p.id,
        name: p.name,
        description: p.description,
        lat: lat,
        lon: lng,
      });
      refreshPoints(); // อัปเดตแผนที่ real-time
    });

    marker.addTo(userPointsLayer);
    userMarkers.push({ marker: marker, name: p.name, id: p.id });

    const option = document.createElement("option");
    option.value = p.id;
    option.text = p.name;
    select.add(option);
  });
}

// โหลดครั้งแรก
refreshPoints();

// ==========================
// เพิ่มจุดด้วย double-click
let clickedLatLng = null;

// Modal controls - initialize after DOM is ready
let modal, closeBtn, submitBtn;

function initModal() {
  modal = document.getElementById("addPointModal");
  closeBtn = document.querySelector(".close");
  submitBtn = document.getElementById("submitBtn");

  console.log("Initializing modal...", {modal, closeBtn, submitBtn});

  if (!modal || !closeBtn || !submitBtn) {
    console.error("Modal elements not found", {modal: !!modal, closeBtn: !!closeBtn, submitBtn: !!submitBtn});
    return;
  }
  
  console.log("Modal initialized successfully");

  closeBtn.onclick = function() {
    modal.style.display = "none";
    clickedLatLng = null;
  };

  submitBtn.onclick = async function() {
    const name = document.getElementById("pointName").value.trim();
    if (!name) {
      alert("กรุณากรอก Name");
      return;
    }

    const typeDorm = document.getElementById("pointTypeDorm").value.trim();
    const lat = document.getElementById("pointLat").value;
    const lon = document.getElementById("pointLon").value;

    try {
      await axios.post("./add_point.php", {
        name: name,
        description: typeDorm,
        lat: lat,
        lon: lon,
      });

      modal.style.display = "none";
      refreshPoints(); // อัปเดตแผนที่ทันที
      alert("เพิ่มจุดสำเร็จ");
      clickedLatLng = null;
    } catch (error) {
      console.error("Error adding point:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มจุด");
    }
  };

  // Close modal when clicking outside
  modal.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      clickedLatLng = null;
    }
  });
}

// Initialize modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModal);
} else {
  initModal();
}

// ==========================
// ปิดการใช้งาน click event listener เก่า (ถ้ามี)
map.off("click");

// ==========================
// เพิ่มจุดด้วย double-click
map.on("dblclick", async (e) => {
  // ป้องกันการเรียก event listener อื่น
  e.originalEvent?.stopPropagation();
  
  console.log("Double-click detected!");
  if (!modal) {
    console.log("Modal not initialized, initializing now...");
    initModal();
  }
  if (!modal) {
    console.error("Modal still not found after initialization!");
    return;
  }
  clickedLatLng = e.latlng;
  console.log("LatLng:", e.latlng);
  
  const latInput = document.getElementById("pointLat");
  const lonInput = document.getElementById("pointLon");
  const nameInput = document.getElementById("pointName");
  const typeDormInput = document.getElementById("pointTypeDorm");
  
  if (latInput && lonInput && nameInput && typeDormInput) {
    latInput.value = e.latlng.lat;
    lonInput.value = e.latlng.lng;
    nameInput.value = "";
    typeDormInput.value = "";
    modal.style.display = "block";
    console.log("Modal should be visible now");
  } else {
    console.error("Form inputs not found!", {latInput, lonInput, nameInput, typeDormInput});
  }
});

// ==========================
// ลบจุด
async function deletePoint(id) {
  if (!confirm("ต้องการลบจุดนี้หรือไม่?")) return;
  await axios.post("./delete_point.php", { id });
  refreshPoints(); // อัปเดตแผนที่
  alert("ลบสำเร็จ");
}

// ==========================
// แก้ไขจุด
async function editPoint(id, oldName, oldDesc, marker) {
  const name = prompt("ชื่อใหม่:", oldName);
  if (!name) return;
  const desc = prompt("รายละเอียดใหม่:", oldDesc);

  const { lat, lng } = marker.getLatLng();

  await axios.post("./update_point.php", {
    id,
    name,
    description: desc,
    lat,
    lon: lng,
  });
  refreshPoints(); // อัปเดตแผนที่
  alert("อัปเดตสำเร็จ");
}

// ==========================
// dropdown เลือก marker
document.getElementById("searchSelect").onchange = function () {
  const selectedId = this.value;
  if (!selectedId) return;

  const item = userMarkers.find((x) => x.id == selectedId);
  if (item) {
    map.setView(item.marker.getLatLng(), 16);
    item.marker.openPopup();
  }
};

// ==========================
// รีเซ็ต zoom และ dropdown
document.getElementById("resetBtn").onclick = function () {
  map.setView([16.5, 100.5], 8);
  document.getElementById("searchSelect").value = "";
};

// ==========================
// Layer Control
const baseMaps = { OSM: osm, Satellite: satellite, Terrain: topo };
const overlayMaps = { "จุดที่บึนทึกลง (database)": userPointsLayer };
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
