// ==========================================
// 1. KHỞI TẠO BLOCKLY & CODEMIRROR (LIGHT THEME)
// ==========================================
const mobiStemTheme = Blockly.Theme.defineTheme('mobiStemTheme', {
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
    theme: mobiStemTheme,
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
let pendingTabBtn = null; // Biến lưu tạm nút tab MQTT đang chờ đăng nhập

function switchTab(tabId, btn) {
    // Nếu bấm vào tab MQTT, chặn lại và hiện form đăng nhập
    if (tabId === 'tab-mqtt') {
        document.getElementById('loginOverlay').style.display = 'flex';
        pendingTabBtn = btn;
        return; 
    }
    // Nếu là tab Blockly thì cho qua luôn
    executeSwitchTab(tabId, btn);
}

// Hàm thực thi chuyển tab (sau khi đã duyệt)
function executeSwitchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    if (tabId === 'tab-blockly') { Blockly.svgResize(workspace); if (codeEditor) codeEditor.refresh(); }
}

function closeLoginModal() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    pendingTabBtn = null;
}

function verifyAdmin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === "admin" && pass === "12345678") {
        closeLoginModal();
        executeSwitchTab('tab-mqtt', pendingTabBtn); // Đăng nhập đúng thì gọi hàm chuyển tab
    } else {
        alert("⚠️ Tài khoản hoặc mật khẩu không chính xác!");
    }
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
for (let i = 0; i < 64; i++) {
    let cell = document.createElement('div'); cell.className = 'led-cell';
    cell.onclick = function () { this.classList.toggle('on'); updateHexPreview(); };
    gridDiv.appendChild(cell);
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
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    const btnConn = document.getElementById('btn-connect');
    const btnDisconn = document.getElementById('btn-disconnect');
    const statusContainer = document.getElementById('mqtt-status');

    text.innerText = msg;

    if (state === 'connecting') {
        icon.className = "fa-solid fa-spinner fa-spin";
        statusContainer.style.color = "#eab308"; // Vàng
        btnConn.disabled = true;
    } else if (state === 'connected') {
        icon.className = "fa-solid fa-circle-check";
        statusContainer.style.color = "#04825d"; // Xanh lá
        btnConn.style.display = "none";
        btnDisconn.style.display = "inline-flex";
        btnConn.disabled = false;
    } else { // disconnected or error
        icon.className = "fa-solid fa-circle-xmark";
        statusContainer.style.color = state === 'error' ? "#dc2626" : "#64748b"; // Đỏ hoặc Xám
        btnConn.style.display = "inline-flex";
        btnDisconn.style.display = "none";
        btnConn.disabled = false;
    }
}

function connectMQTT() {
    const host = document.getElementById('host').value; 
    const port = parseInt(document.getElementById('port').value);
    const user = document.getElementById('user').value; 
    const pass = document.getElementById('pass').value;

    updateMQTTStatus('connecting', 'Đang kết nối...');

    client = new Paho.MQTT.Client(host, port, "MobiSTEM_" + Math.random().toString(16).substr(2, 5));
    
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

function sendData() {
    if (!client || !client.isConnected()) return alert("⚠️ Vui lòng KẾT NỐI BROKER trước!");
    const code = codeEditor.getValue();
    if (!code.trim()) return alert("Không có code để nạp!");
    const payloadObj = {}; payloadObj[document.getElementById('jsonKey').value || "main"] = code;
    try {
        let msg = new Paho.MQTT.Message(JSON.stringify(payloadObj));
        msg.destinationName = document.getElementById('topic').value;
        client.send(msg); alert("🚀 Đã nạp Code thành công!");
    } catch (e) { alert("Lỗi gửi: " + e.message); }
}

function sendStopCommand() {
    if (!client || !client.isConnected()) return alert("⚠️ Vui lòng KẾT NỐI BROKER trước!");

    // Sử dụng dấu backtick (`) để tạo chuỗi nhiều dòng trong JavaScript
    const stopScript = `print("exit")`; // Mình giữ lại print("exit") để tương thích với ngắt vòng lặp (nếu có)

    const payloadObj = {};
    payloadObj[document.getElementById('jsonKey').value || "main"] = stopScript;

    try {
        let msg = new Paho.MQTT.Message(JSON.stringify(payloadObj));
        msg.destinationName = document.getElementById('topic').value;
        client.send(msg);
        alert("🛑 Đã gửi lệnh NGẮT CODE và dọn dẹp phần cứng!");
    } catch (e) {
        alert("Lỗi gửi: " + e.message);
    }
}

function saveProject() {
    try {
        // 1. Hiển thị hộp thoại nhập tên dự án
        let projectName = prompt("Vui lòng nhập tên dự án của bạn:", "Du_An_Robot");

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

        alert("💾 Đã tải file [" + fileName + "] về máy thành công!");
    } catch (e) {
        alert("Lỗi khi lưu bài: " + e);
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

            // Chuyển chuỗi văn bản thành cấu trúc XML
            let xml = Blockly.utils.xml.textToDom(xmlText);

            // Xóa sạch bàn làm việc hiện tại
            workspace.clear();

            // Nhúng XML vào lại bàn làm việc thành các khối kéo thả
            Blockly.Xml.domToWorkspace(xml, workspace);

            alert("📂 Đã mở bài thành công!");
        } catch (err) {
            alert("⚠️ Lỗi: File không đúng định dạng của STEM!\n" + err);
        }

        // Reset lại thẻ input file để có thể chọn lại chính file đó lần sau
        document.getElementById('fileInput').value = "";
    };

    // Đọc nội dung file dưới dạng Text
    reader.readAsText(file);
}
