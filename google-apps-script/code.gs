/**
 * LLST Sport App - Google Apps Script Backend
 * 
 * Instructions:
 * 1. Create a new Google Sheet.
 * 2. Rename the first sheet to "Students" and the second to "Results".
 * 3. In the "Students" sheet, add headers in row 1: ID, Name, House, Points
 * 4. In the "Results" sheet, add headers in row 1: ID, Timestamp, Race Type, Division, Heat, Lane, Athlete Name, House, Time
 * 5. Go to Extensions > Apps Script.
 * 6. Paste this code into the editor.
 * 7. Click Deploy > New Deployment > Web App.
 * 8. Set "Execute as" to "Me" and "Who has access" to "Anyone".
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('LLST Sport App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function getStudents() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  return data.map(row => ({
    id: row[0].toString(),
    name: row[1],
    house: row[2],
    points: Number(row[3]) || 0
  }));
}

function addStudent(name, house) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  const id = new Date().getTime().toString();
  sheet.appendRow([id, name, house, 0]);
  return { id, name, house, points: 0 };
}

function updateStudent(id, newName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id) {
      sheet.getRange(i + 1, 2).setValue(newName);
      return;
    }
  }
}

function saveRaceResult(result) {
  const resultsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Results');
  const studentsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  
  const id = new Date().getTime().toString();
  const timestamp = new Date().toISOString();
  
  // Append to results
  resultsSheet.appendRow([
    id, 
    timestamp, 
    result.raceType, 
    result.division, 
    result.heat, 
    result.lane, 
    result.athleteName, 
    result.house, 
    result.time
  ]);
  
  // Update points in Students sheet
  // For simplicity, we add 5 points for every finish
  // You can customize this logic based on placement
  const studentNames = result.athleteName.split(' & '); // Handle relay
  const studentData = studentsSheet.getDataRange().getValues();
  
  studentNames.forEach(name => {
    for (let i = 1; i < studentData.length; i++) {
      if (studentData[i][1] === name.trim()) {
        const currentPoints = Number(studentData[i][3]) || 0;
        studentsSheet.getRange(i + 1, 4).setValue(currentPoints + 5);
        break;
      }
    }
  });
}

function getHousePoints() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  const data = sheet.getDataRange().getValues();
  const totals = { Blue: 0, Red: 0, Yellow: 0 };
  
  for (let i = 1; i < data.length; i++) {
    const house = data[i][2];
    const points = Number(data[i][3]) || 0;
    if (totals.hasOwnProperty(house)) {
      totals[house] += points;
    }
  }
  
  return totals;
}
