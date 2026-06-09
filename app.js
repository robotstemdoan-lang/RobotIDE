// ==========================================
// 1. KHỞI TẠO BLOCKLY & CODEMIRROR (LIGHT THEME)
// ==========================================
const uttStemTheme = Blockly.Theme.defineTheme('uttStemTheme', {
    'base': Blockly.Themes.Classic,
    'componentStyles': {
        'workspaceBackgroundColour': '#ffffff', /* Màu nền khu vực kéo thả (Trắng) */
        'toolboxBackgroundColour': '#f8fafc',   /* Màu nền thanh menu bên trái */
        'toolboxForegroundColour': '#334155',   /* Màu chữ thanh menu (Xám đậm) */
        'flyoutBackgroundColour': '#f1f5f9',    /* Màu nền khung chứa khối lệnh (Pop-up) */
        'flyoutForegroundColour': '#1e293b',
        'flyoutOpacity': 0.95,
        'scrollbarColour': '#cbd5e1',           /* Thanh cuộn màu xám bạc */
        'scrollbarOpacity': 0.8,
    }
});

function buildToolbox(deviceId) {
    let common = document.getElementById('common_blocks').innerHTML;
    let specific = document.getElementById('toolbox_' + deviceId).innerHTML;
    return '<xml>' + common + '<sep gap="30"></sep>' + specific + '</xml>';
}



const workspace = Blockly.inject('blocklyDiv', {
    toolbox: buildToolbox('robot'), // Thay vì document.getElementById('toolbox')
    theme: uttStemTheme,
    grid: { spacing: 20, length: 3, colour: '#e2e8f0', snap: true },
    trashcan: true,
    zoom: { controls: true, wheel: true, startScale: 1.18, maxScale: 2.5, minScale: 0.7, scaleSpeed: 1.1, pinch: true }
});

let client = null;
let codeEditor = null;

window.onload = function () {
    // Chuyển theme của CodeMirror từ "monokai" (tối) sang "default" (sáng)
    codeEditor = CodeMirror.fromTextArea(document.getElementById('pythonCode'), {
        mode: "python", theme: "default", lineNumbers: true, indentUnit: 4
    });

    workspace.addChangeListener(function (e) {
        if (e.isUiEvent) return;
        let code = pyGen.workspaceToCode(workspace);
        if (codeEditor) codeEditor.setValue(code);
    });
};

// ==========================================
// 2. GIAO DIỆN CHUYỂN TAB & ẨN HIỆN
// ==========================================
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    if (tabId === 'tab-blockly') { Blockly.svgResize(workspace); if (codeEditor) codeEditor.refresh(); }
}

// Giữ nguyên hàm toggleCodePanel và togglePassword ở dưới...

function toggleCodePanel() {
    document.getElementById('tab-blockly').classList.toggle('show-code');
    setTimeout(() => { Blockly.svgResize(workspace); if (codeEditor) codeEditor.refresh(); }, 300);
}

function togglePassword() {
    const passInput = document.getElementById('pass'); const toggleBtn = document.querySelector('.toggle-pass');
    if (passInput.type === "password") { passInput.type = "text"; toggleBtn.innerText = "ẨN"; }
    else { passInput.type = "password"; toggleBtn.innerText = "HIỆN"; }
}

// ==========================================
// 3. LOGIC BẢNG VẼ MA TRẬN 8x8
// ==========================================
let currentEditingBlock = null;
const gridDiv = document.getElementById('ledGrid');

let isDrawing = false;
let drawMode = true; // true = tô, false = xóa

gridDiv.addEventListener('contextmenu', (e) => e.preventDefault()); // Chặn menu chuột phải mặc định

gridDiv.addEventListener('mousedown', (e) => {
    isDrawing = true;
    e.preventDefault(); // Ngăn chọn text khi kéo
});

window.addEventListener('mouseup', () => {
    isDrawing = false;
});

for (let i = 0; i < 64; i++) {
    let cell = document.createElement('div'); cell.className = 'led-cell';

    cell.addEventListener('mousedown', function (e) {
        drawMode = (e.button !== 2); // Chuột trái/giữa = tô (true), Chuột phải = xóa (false)
        if (drawMode) this.classList.add('on');
        else this.classList.remove('on');
        updateHexPreview();
    });

    cell.addEventListener('mouseenter', function () {
        if (isDrawing) {
            if (drawMode) this.classList.add('on');
            else this.classList.remove('on');
            updateHexPreview();
        }
    });

    gridDiv.appendChild(cell);
}

const templates = {
    smile: "[0x3C,0x42,0xA5,0x81,0xA5,0x99,0x42,0x3C]",
    sad: "[0x3C,0x42,0xA5,0x81,0x99,0xA5,0x42,0x3C]",
    heart: "[0x00,0x66,0xFF,0xFF,0x7E,0x3C,0x18,0x00]",
    arrow_up: "[0x18,0x3C,0x7E,0xFF,0x18,0x18,0x18,0x18]",
    arrow_down: "[0x18,0x18,0x18,0x18,0xFF,0x7E,0x3C,0x18]",
    arrow_left: "[0x10,0x30,0x70,0xFF,0xFF,0x70,0x30,0x10]",
    arrow_right: "[0x08,0x0C,0x0E,0xFF,0xFF,0x0E,0x0C,0x08]",
    check: "[0x00,0x01,0x02,0x04,0x88,0x50,0x20,0x00]",
    warning: "[0x81,0x42,0x24,0x18,0x18,0x24,0x42,0x81]"
};

function loadTemplate(name) {
    if (templates[name]) {
        parseHexToGrid(templates[name]);
    }
}

function openMatrixEditor(block) {
    currentEditingBlock = block;
    parseHexToGrid(block.getFieldValue('HEX_ARRAY'));
    document.getElementById('matrixOverlay').style.display = 'flex';
}

function closeMatrixEditor() { document.getElementById('matrixOverlay').style.display = 'none'; currentEditingBlock = null; }
function clearMatrix() { document.querySelectorAll('.led-cell').forEach(c => c.classList.remove('on')); updateHexPreview(); }

function updateHexPreview() {
    let cells = document.querySelectorAll('.led-cell'); let hexArr = [];
    for (let r = 0; r < 8; r++) {
        let byte = 0;
        for (let c = 0; c < 8; c++) if (cells[r * 8 + c].classList.contains('on')) byte |= (1 << (7 - c));
        hexArr.push("0x" + byte.toString(16).padStart(2, '0').toUpperCase());
    }
    let hexStr = "[" + hexArr.join(",") + "]";
    document.getElementById('matrixHexPreview').innerText = hexStr;
    return hexStr;
}

function saveMatrixEditor() {
    if (currentEditingBlock) currentEditingBlock.setFieldValue(updateHexPreview(), 'HEX_ARRAY');
    closeMatrixEditor();
}

function parseHexToGrid(hexStr) {
    clearMatrix();
    try {
        let cleanStr = hexStr.replace(/[\[\]]/g, '');
        let bytes = cleanStr.split(',').map(s => parseInt(s.trim(), 16));
        let cells = document.querySelectorAll('.led-cell');
        for (let r = 0; r < 8; r++) {
            let byte = isNaN(bytes[r]) ? 0 : bytes[r];
            for (let c = 0; c < 8; c++) if ((byte & (1 << (7 - c))) !== 0) cells[r * 8 + c].classList.add('on');
        }
        updateHexPreview();
    } catch (e) { }
}

// ==========================================
// 4. MQTT & NẠP CODE
// ==========================================
function updateMQTTStatus(state, msg) {
    // Nút ở tab Blockly
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    const btnConn = document.getElementById('btn-connect');
    const btnDisconn = document.getElementById('btn-disconnect');
    const statusContainer = document.getElementById('mqtt-status');

    // Nút ở tab Settings (Cấu hình)
    const settingsStatusBox = document.getElementById('status');
    const settingsConnectBtn = document.getElementById('connectBtn');
    const settingsDisconnectBtn = document.getElementById('disconnectBtn');

    // Cập nhật text chung
    text.innerText = msg;

    if (state === 'connecting') {
        // Tab Blockly
        icon.className = "fa-solid fa-spinner fa-spin";
        statusContainer.style.color = "#eab308"; // Vàng
        btnConn.disabled = true;

        // Tab Settings
        if (settingsStatusBox) {
            settingsStatusBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Trạng thái: ${msg}</span>`;
            settingsStatusBox.className = "status-box";
            settingsStatusBox.style.color = "#eab308";
        }
        if (settingsConnectBtn) settingsConnectBtn.disabled = true;

    } else if (state === 'connected') {
        // Tab Blockly
        icon.className = "fa-solid fa-circle-check";
        statusContainer.style.color = "#04825d"; // Xanh lá
        btnConn.style.display = "none";
        btnDisconn.style.display = "inline-flex";
        btnConn.disabled = false;

        // Tab Settings
        if (settingsStatusBox) {
            settingsStatusBox.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>Trạng thái: ${msg}</span>`;
            settingsStatusBox.className = "status-box connected";
            settingsStatusBox.style.color = ""; // Xóa màu inline để nhận class
        }
        if (settingsConnectBtn) {
            settingsConnectBtn.style.display = "none";
            settingsConnectBtn.disabled = false;
        }
        if (settingsDisconnectBtn) settingsDisconnectBtn.style.display = "inline-flex";

    } else { // disconnected or error
        // Tab Blockly
        icon.className = "fa-solid fa-circle-xmark";
        statusContainer.style.color = state === 'error' ? "#dc2626" : "#64748b"; // Đỏ hoặc Xám
        btnConn.style.display = "inline-flex";
        btnDisconn.style.display = "none";
        btnConn.disabled = false;

        // Tab Settings
        if (settingsStatusBox) {
            settingsStatusBox.innerHTML = `<i class="fa-solid fa-circle-xmark"></i><span>Trạng thái: ${msg}</span>`;
            settingsStatusBox.className = state === 'error' ? "status-box error" : "status-box";
            settingsStatusBox.style.color = "";
        }
        if (settingsConnectBtn) {
            settingsConnectBtn.style.display = "inline-flex";
            settingsConnectBtn.disabled = false;
        }
        if (settingsDisconnectBtn) settingsDisconnectBtn.style.display = "none";
    }
}

function connectMQTT() {
    const host = document.getElementById('host').value;
    const port = parseInt(document.getElementById('port').value);
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    updateMQTTStatus('connecting', 'Đang kết nối...');

    client = new Paho.MQTT.Client(host, port, "UTTSTEM_" + Math.random().toString(16).substr(2, 5));

    client.onConnectionLost = (res) => {
        updateMQTTStatus('error', 'Mất kết nối!');
    };

    client.connect({
        timeout: 5, useSSL: true, userName: user, password: pass, cleanSession: true,
        onSuccess: () => { updateMQTTStatus('connected', 'Đã kết nối'); },
        onFailure: (msg) => { updateMQTTStatus('error', 'Lỗi kết nối'); }
    });
}

function disconnectMQTT() {
    if (client && client.isConnected()) {
        client.disconnect();
        updateMQTTStatus('disconnected', 'Chưa kết nối');
    }
}

function showToast(msg, type = 'success') {
    let toast = document.getElementById('utt-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'utt-toast';
        document.body.appendChild(toast);
    }
    toast.className = 'toast show ' + type;
    toast.innerHTML = msg;
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
        toast.className = toast.className.replace('show', '').trim();
    }, 3000);
}

function sendData() {
    if (!client || !client.isConnected()) return showToast("⚠️ Vui lòng KẾT NỐI BROKER trước!", "error");
    const code = codeEditor.getValue();
    if (!code.trim()) return showToast("⚠️ Không có code để nạp!", "error");
    const payloadObj = {}; payloadObj[document.getElementById('jsonKey').value || "main"] = code;
    try {
        let msg = new Paho.MQTT.Message(JSON.stringify(payloadObj));
        msg.destinationName = document.getElementById('topic').value;
        client.send(msg); showToast("🚀 Đã nạp Code thành công!", "success");
    } catch (e) { showToast("Lỗi gửi: " + e.message, "error"); }
}

function sendStopCommand() {
    if (!client || !client.isConnected()) return showToast("⚠️ Vui lòng KẾT NỐI BROKER trước!", "error");

    // Sử dụng dấu backtick (`) để tạo chuỗi nhiều dòng trong JavaScript
    const stopScript = `print("exit")`; // Mình giữ lại print("exit") để tương thích với ngắt vòng lặp (nếu có)

    const payloadObj = {};
    payloadObj[document.getElementById('jsonKey').value || "main"] = stopScript;

    try {
        let msg = new Paho.MQTT.Message(JSON.stringify(payloadObj));
        msg.destinationName = document.getElementById('topic').value;
        client.send(msg);
        showToast("🛑 Đã gửi lệnh NGẮT CODE và dọn dẹp phần cứng!", "success");
    } catch (e) {
        showToast("Lỗi gửi: " + e.message, "error");
    }
}

// ==========================================
// 5. QUẢN LÝ DỰ ÁN (LƯU & MỞ)
// ==========================================

function openOpenProjectModal() {
    document.getElementById('openProjectOverlay').style.display = 'flex';
}

function closeOpenProjectModal() {
    document.getElementById('openProjectOverlay').style.display = 'none';
}

function loadTemplateProject(fileName) {
    fetch('template_project/' + fileName)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi tải file");
            return response.text();
        })
        .then(xmlText => {
            // Xử lý nạp phần Ghi chú nếu có
            let noteMatch = xmlText.match(/<note_data>([\s\S]*?)<\/note_data>/);
            if (noteMatch) {
                document.getElementById('noteContent').value = noteMatch[1].trim();
                document.getElementById('notePanel').style.display = 'flex';
                xmlText = xmlText.replace(/<note_data>[\s\S]*?<\/note_data>/, '');
            } else {
                document.getElementById('noteContent').value = '';
                document.getElementById('notePanel').style.display = 'none';
            }

            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(xmlText, "text/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                showToast("File mẫu không hợp lệ", "error");
                return;
            }
            workspace.clear();
            Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
            showToast("Đã tải " + fileName.replace('.utt', ''), "success");
            closeOpenProjectModal();
        })
        .catch(err => {
            if (window.location.protocol === 'file:') {
                showToast("Vui lòng chạy bằng Local Server để tải bài mẫu.", "error");
            } else {
                showToast("Không thể tải bài mẫu. Lỗi: " + err.message, "error");
            }
        });
}

function saveProject() {
    try {
        // 1. Hiển thị hộp thoại nhập tên dự án
        let projectName = prompt("Vui lòng nhập tên dự án của bạn:", "Bai_hoc_1");

        // Nếu người dùng bấm "Hủy" (Cancel) thì không làm gì cả
        if (projectName === null) {
            return;
        }

        // Nếu người dùng xóa trắng rồi bấm OK, tự động gán tên mặc định
        if (projectName.trim() === "") {
            projectName = "Bai_hoc_1";
        }

        projectName = projectName.replace(/\.utt$/i, '');
        let fileName = projectName + ".utt";

        // 2. Chuyển đổi khối thành XML
        let xml = Blockly.Xml.workspaceToDom(workspace);
        let xmlText = Blockly.Xml.domToText(xml);

        // Chèn nội dung ghi chú (nếu có) vào cuối file XML trước thẻ đóng
        let note = document.getElementById('noteContent').value;
        if (note && note.trim() !== "") {
            xmlText = xmlText.replace('</xml>', `  <note_data>\n${note}\n</note_data>\n</xml>`);
        }

        // 3. Tạo file và tải xuống
        let blob = new Blob([xmlText], { type: 'text/xml' });
        let url = URL.createObjectURL(blob);

        let a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Sử dụng tên file người dùng vừa đặt

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("💾 Đã tải file [" + fileName + "] về máy thành công!", "success");
    } catch (e) {
        showToast("Lỗi khi lưu bài: " + e, "error");
    }
}

function toggleNotePanel() {
    let panel = document.getElementById('notePanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
    }
}

// Hàm Mở Project
function loadProject(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        try {
            let xmlText = e.target.result;

            // Xử lý nạp phần Ghi chú nếu có
            let noteMatch = xmlText.match(/<note_data>([\s\S]*?)<\/note_data>/);
            if (noteMatch) {
                document.getElementById('noteContent').value = noteMatch[1].trim();
                document.getElementById('notePanel').style.display = 'flex';
                xmlText = xmlText.replace(/<note_data>[\s\S]*?<\/note_data>/, '');
            } else {
                document.getElementById('noteContent').value = '';
                document.getElementById('notePanel').style.display = 'none';
            }

            // Chuyển chuỗi văn bản thành cấu trúc XML
            let xml = Blockly.utils.xml.textToDom(xmlText);

            // Xóa sạch bàn làm việc hiện tại
            workspace.clear();

            // Nhúng XML vào lại bàn làm việc thành các khối kéo thả
            Blockly.Xml.domToWorkspace(xml, workspace);

            showToast("📂 Đã mở bài thành công!", "success");
        } catch (err) {
            showToast("⚠️ Lỗi: File không đúng định dạng của hệ thống!<br>" + err, "error");
        }

        // Reset lại thẻ input file để có thể chọn lại chính file đó lần sau
        document.getElementById('fileInput').value = "";
    };

    // Đọc nội dung file dưới dạng Text
    reader.readAsText(file);
}