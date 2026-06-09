// ==========================================
// 1. ĐỊNH NGHĨA HÌNH DÁNG KHỐI (RÚT GỌN)
// ==========================================
const paletteIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23fff" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';

Blockly.Blocks['main_loop'] = { init: function () { this.appendDummyInput().appendField("🔄 Vòng lặp chính"); this.appendStatementInput("DO").setCheck(null); this.setColour("#FFAB19"); } };
Blockly.Blocks['time_delay'] = { init: function () { this.appendValueInput("TIME").setCheck("Number").appendField("⏳ Chờ (giây)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FFAB19"); } };

Blockly.Blocks['motor_straight'] = { init: function () { this.appendDummyInput().appendField("🚗 Di chuyển").appendField(new Blockly.FieldDropdown([["Tiến", "move_straight"], ["Lùi", "move_sideway"]]), "TYPE"); this.appendValueInput("DIST").setCheck("Number").appendField("khoảng cách (cm)"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };
Blockly.Blocks['motor_basic'] = { init: function () { this.appendDummyInput().appendField("🚗 Chạy liên tục").appendField(new Blockly.FieldDropdown([["Tiến thẳng", "go_forward"], ["Lùi lại", "go_backward"], ["Xoay trái", "turn_left"], ["Xoay phải", "turn_right"]]), "ACTION"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };
Blockly.Blocks['motor_stop'] = { init: function () { this.appendDummyInput().appendField("🛑 Dừng tất cả động cơ"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };

Blockly.Blocks['servo_set'] = {
    init: function () {
        this.appendDummyInput().appendField("🦾 Cài góc cho servo");
        this.appendValueInput("ANGLE").setCheck("Number").appendField("ở (độ)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF6680");
    }
};

Blockly.Blocks['matrix_icon_custom'] = { init: function () { this.appendDummyInput().appendField("🔠 Matrix vẽ Icon").appendField(new Blockly.FieldImage(paletteIcon, 22, 22, "🎨 Vẽ", function (field) { openMatrixEditor(field.getSourceBlock()); })).appendField(new Blockly.FieldTextInput("[0x00,0x66,0xFF,0xFF,0x7E,0x3C,0x18,0x00]"), "HEX_ARRAY"); this.appendValueInput("X").setCheck("Number").appendField("tại X"); this.appendValueInput("Y").setCheck("Number").appendField("Y"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };
Blockly.Blocks['led7_show'] = { init: function () { this.appendValueInput("NUM").setCheck("Number").appendField("💡 LED 7 hiện số"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };
Blockly.Blocks['matrix_scroll'] = { init: function () { this.appendValueInput("TEXT").setCheck(null).appendField("🔠 Matrix chạy chữ"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };

Blockly.Blocks['sound_play'] = { init: function () { this.appendValueInput("TRACK").setCheck("Number").appendField("🎵 Phát bài hát số"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_vol'] = { init: function () { this.appendValueInput("VOL").setCheck("Number").appendField("🎵 Đặt âm lượng (0-30)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_stop'] = { init: function () { this.appendDummyInput().appendField("🔇 Tắt nhạc"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };

Blockly.Blocks['sensor_dist'] = { init: function () { this.appendDummyInput().appendField("📡 Khoảng cách siêu âm (cm)"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };

Blockly.Blocks['convert_tostring'] = { init: function () { this.appendValueInput("VAL").appendField("🔤 Chuyển thành Chữ"); this.setOutput(true, "String"); this.setColour("#5CA68D"); } };
Blockly.Blocks['convert_tonumber'] = { init: function () { this.appendValueInput("VAL").appendField("🔢 Chuyển thành Số"); this.setOutput(true, "Number"); this.setColour("#5C68A6"); } };
Blockly.Blocks['get_time_internet'] = { init: function () { this.appendDummyInput().appendField("🕒 Lấy thời gian thực").appendField(new Blockly.FieldDropdown([["Giờ (0-23)", "HOUR"], ["Phút (0-59)", "MINUTE"], ["Giây (0-59)", "SECOND"]]), "TIME_TYPE"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };

// ==========================================
// 2. DỊCH MÃ PYTHON (API MỚI)
// ==========================================
const pyGen = python.pythonGenerator;

function clampCode(valCode, minVal, maxVal) {
    let clean = valCode.trim();
    if (clean.startsWith('(') && clean.endsWith(')')) clean = clean.substring(1, clean.length - 1);
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
        let v = parseFloat(clean);
        if (v < minVal) return minVal.toString();
        if (v > maxVal) return maxVal.toString();
        return clean;
    }
    return `max(${minVal}, min(${maxVal}, ${valCode}))`;
}

pyGen.forBlock['main_loop'] = function (block, generator) {
    let branch = generator.statementToCode(block, 'DO'); let indent = generator.INDENT || "  ";
    let code = 'while True:\n';
    if (branch) code += branch; else code += indent + 'pass\n';
    code += indent + 'time.sleep(0.05)\n';
    return code;
};

pyGen.forBlock['time_delay'] = function (block, generator) { let time = generator.valueToCode(block, 'TIME', pyGen.ORDER_ATOMIC) || '1'; return `time.sleep(${time})\n`; };

pyGen.forBlock['motor_straight'] = function (block, generator) {
    let type = block.getFieldValue('TYPE');
    let dist = generator.valueToCode(block, 'DIST', pyGen.ORDER_ATOMIC) || '0';
    let speedSafe = clampCode(generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0', 0, 1);
    if (type === 'move_straight') return `robot.move_forward_cm(${dist}, max_speed=${speedSafe})\n`;
    return `robot.move_backward_cm(${dist}, max_speed=${speedSafe})\n`;
};

pyGen.forBlock['motor_basic'] = function (block, generator) {
    let action = block.getFieldValue('ACTION');
    let speedSafe = clampCode(generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0', 0, 1);
    if (action === 'go_forward') return `robot.forward(speed=${speedSafe})\n`;
    if (action === 'go_backward') return `robot.backward(speed=${speedSafe})\n`;
    if (action === 'turn_left') return `robot.turn_left(speed=${speedSafe})\n`;
    return `robot.turn_right(speed=${speedSafe})\n`;
};

pyGen.forBlock['motor_stop'] = function () { return 'robot.stop()\n'; };

pyGen.forBlock['servo_set'] = function (block, generator) {
    let angleSafe = clampCode(generator.valueToCode(block, 'ANGLE', pyGen.ORDER_ATOMIC) || '0', 0, 180);
    return `servo.set_angle(${angleSafe})\n`;
};

pyGen.forBlock['matrix_icon_custom'] = function (block) {
    let hexArr = block.getFieldValue('HEX_ARRAY');
    return `matrix.draw_custom(${hexArr})\n`;
};

pyGen.forBlock['led7_show'] = function (block, generator) {
    let num = generator.valueToCode(block, 'NUM', pyGen.ORDER_ATOMIC) || '0';
    return `display.display_number(${num})\n`;
};

pyGen.forBlock['matrix_scroll'] = function (block, generator) {
    let text = generator.valueToCode(block, 'TEXT', pyGen.ORDER_NONE) || '""';
    let speed = generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0.08';
    return `matrix.scroll_text(str(${text}), speed=${speed}, loop=False)\n`;
};

pyGen.forBlock['sound_play'] = function (block, generator) {
    let track = generator.valueToCode(block, 'TRACK', pyGen.ORDER_ATOMIC) || '1';
    return `player.play_track(${track})\n`;
};

pyGen.forBlock['sound_vol'] = function (block, generator) {
    let volSafe = clampCode(generator.valueToCode(block, 'VOL', pyGen.ORDER_ATOMIC) || '10', 0, 30);
    return `player.set_volume(${volSafe})\n`;
};

pyGen.forBlock['sound_stop'] = function () { return `player.stop()\n`; };

pyGen.forBlock['sensor_dist'] = function () {
    return ['hcsr04.get_distance()', pyGen.ORDER_ATOMIC];
};

pyGen.forBlock['convert_tostring'] = function (block, generator) {
    let val = generator.valueToCode(block, 'VAL', pyGen.ORDER_NONE) || '0';
    return [`str(${val})`, pyGen.ORDER_FUNCTION_CALL];
};
pyGen.forBlock['convert_tonumber'] = function (block, generator) {
    let val = generator.valueToCode(block, 'VAL', pyGen.ORDER_NONE) || '""';
    return [`float(${val})`, pyGen.ORDER_FUNCTION_CALL];
};
pyGen.forBlock['get_time_internet'] = function (block) {
    let type = block.getFieldValue('TIME_TYPE');
    if (type === 'HOUR') return ['time.localtime()[3]', pyGen.ORDER_FUNCTION_CALL];
    if (type === 'MINUTE') return ['time.localtime()[4]', pyGen.ORDER_FUNCTION_CALL];
    return ['time.localtime()[5]', pyGen.ORDER_FUNCTION_CALL];
};