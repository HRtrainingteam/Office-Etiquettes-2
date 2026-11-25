/**
 * SMC Office Etiquettes Peer Rating — Google Apps Script
 * Setup: create a Google Sheet, open Extensions > Apps Script, paste this file,
 * save, then Deploy > New deployment > Web app.
 * Execute as: Me. Access: Anyone (or your organisation, if all raters are signed in).
 * Copy the deployment URL into GOOGLE_SCRIPT_URL in index.html.
 */
const SHEET_NAME = "Peer Ratings";
const HEADERS = ["Submitted At","Submitter Name","Employee Code","Rated Employee",
  "Punctuality","Respectful Behaviour","Acts with Integrity",
  "Appropriate Dressing & Professional Appearance","Team Collaboration"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.submitter || !data.employeeCode || !Array.isArray(data.ratings) || data.ratings.length !== 19) {
      throw new Error("Invalid submission");
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); }
    const expected = ["Mehar Singh","Sunanda Mandal","Kanika Malhotra","Ansh Tayal","Poonam Devi","Nikunj Agarwal","Prashant Bhojak","Amit Kumar Goyal","Saurabh Kumar","Avinash Gupta","Nilkesh Kumar Jha","Pawan Kumar Jha","Akshay Sharma","Hetika Bhatt","Reena","Abhinav Goel","Harmit Kumar","Vivek Kumar Jha","Dinesh Kumar","Siddharth Nigam"];
    if (!expected.includes(data.submitter)) throw new Error("Unknown submitter");
    const submittedAt = new Date();
    const rows = data.ratings.map(item => {
      if (!expected.includes(item.employee) || item.employee === data.submitter) throw new Error("Invalid rated employee");
      const scores = HEADERS.slice(4).map(h => Number(item.scores[h]));
      if (scores.some(v => !Number.isInteger(v) || v < 1 || v > 5)) throw new Error("Invalid score");
      return [submittedAt, data.submitter, data.employeeCode, item.employee, ...scores];
    });
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try { sheet.getRange(sheet.getLastRow()+1,1,rows.length,HEADERS.length).setValues(rows); }
    finally { lock.releaseLock(); }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
