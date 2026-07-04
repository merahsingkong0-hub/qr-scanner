// ============================================================
//  QR Scanner - Google Apps Script
//  Paste kode ini di: script.google.com → project Anda
// ============================================================

// ID Spreadsheet tempat data disimpan
// Cara ambil ID: buka spreadsheet → lihat URL
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
// Ganti nilai di bawah ini:
const SPREADSHEET_ID = "1k0fkzBnRJuef09Pd8Jo4M1-T95ScwUImsQ7mDwEIjD4";

// Nama sheet (tab) tempat data masuk
const SHEET_NAME = "HasilScan";

// ============================================================
//  doPost — menerima data dari halaman HTML scanner
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, SHEET_NAME);

    // Tambah header kalau sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Hasil QR / Barcode", "Waktu Lokal", "Device Info"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#1e40af").setFontColor("#ffffff");
    }

    // Simpan data
    const localTime = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm:ss"
    );

    sheet.appendRow([
      new Date(),
      data.qrResult   || "",
      localTime,
      data.deviceInfo || ""
    ]);

    // Auto-resize kolom
    sheet.autoResizeColumns(1, 4);

    return buildResponse({ status: "ok", received: data.qrResult });

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() });
  }
}

// ============================================================
//  doGet — test apakah endpoint aktif
// ============================================================
function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <h2 style="font-family:sans-serif;color:green;">✅ GAS Endpoint Aktif</h2>
    <p style="font-family:sans-serif;">
      Web App berjalan normal.<br>
      Spreadsheet ID: <b>${SPREADSHEET_ID}</b><br>
      Sheet: <b>${SHEET_NAME}</b>
    </p>
  `);
}

// ============================================================
//  Helper: buat sheet kalau belum ada
// ============================================================
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ============================================================
//  Helper: response JSON dengan header CORS
// ============================================================
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
