/**
 * SMC Office Etiquettes — NEW standalone Google Apps Script
 *
 * 1) Create a NEW Google Spreadsheet.
 * 2) Copy its ID from the URL and paste it into SPREADSHEET_ID below.
 * 3) In that spreadsheet, open Extensions > Apps Script and paste this file.
 * 4) Deploy > New deployment > Web app; Execute as: Me; access: Anyone.
 * 5) Copy the /exec URL into GOOGLE_SCRIPT_URL in index.html and publish the site.
 *
 * This script is intentionally independent of the OLD repository/deployment.
 */
const SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/1uhtajo3DJPryqasjJq5yO07ym2KiTRVjd7if0wH4s1s/edit?usp=sharing";
const SHEET_NAME = "Peer Ratings";
const EMPLOYEES = [
  "Mehar Singh", "Sunanda Mandal", "Kanika Malhotra", "Ansh Tayal",
  "Poonam Devi", "Nikunj Agarwal", "Prashant Bhojak", "Amit Kumar Goyal",
  "Saurabh Kumar", "Avinash Gupta", "Nilkesh Kumar Jha", "Pawan Kumar Jha",
  "Akshay Sharma", "Hetika Bhatt", "Reena", "Abhinav Goel", "Harmit Kumar",
  "Vivek Kumar Jha", "Dinesh Kumar", "Siddharth Nigam"
];
const CATEGORIES = [
  "Punctuality", "Respectful Behaviour", "Acts with Integrity",
  "Appropriate Dressing & Professional Appearance", "Team Collaboration"
];
const HEADERS = [
  "Submitted At", "Submitter Name", "Employee Code", "Rated Employee",
  ...CATEGORIES
];

function doGet() {
  return jsonOutput({ ok: true, message: "SMC Peer Rating API is running." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_NEW_GOOGLE_SHEET_ID_HERE") {
      throw new Error("Spreadsheet is not configured. Add the new Google Sheet ID in SPREADSHEET_ID.");
    }
    if (!e || !e.postData || !e.postData.contents) throw new Error("No submission data received.");
    const data = JSON.parse(e.postData.contents);
    const submitter = String(data.submitter || "").trim();
    const employeeCode = String(data.employeeCode || "").trim();
    if (!EMPLOYEES.includes(submitter)) throw new Error("Submitter name is not in the approved employee list.");
    if (!employeeCode) throw new Error("Employee code is required.");
    if (!Array.isArray(data.ratings) || data.ratings.length !== EMPLOYEES.length - 1) {
      throw new Error("Expected ratings for exactly 19 colleagues.");
    }

    const seen = new Set();
    const rows = data.ratings.map(item => {
      const employee = String(item.employee || "").trim();
      if (!EMPLOYEES.includes(employee) || employee === submitter) {
        throw new Error("Invalid colleague in ratings: " + employee);
      }
      if (seen.has(employee)) throw new Error("Duplicate colleague rating: " + employee);
      seen.add(employee);
      const scores = CATEGORIES.map(category => {
        const score = Number(item.scores && item.scores[category]);
        if (!Number.isInteger(score) || score < 1 || score > 5) {
          throw new Error("Invalid score for " + employee + " — " + category);
        }
        return score;
      });
      return [new Date(), submitter, employeeCode, employee, ...scores];
    });
    if (seen.size !== EMPLOYEES.length - 1) throw new Error("One or more colleague ratings are missing.");

    lock.waitLock(15000);
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.setFrozenRows(1);
      }
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    return jsonOutput({ ok: true, rowsSaved: rows.length, submitter: submitter });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
