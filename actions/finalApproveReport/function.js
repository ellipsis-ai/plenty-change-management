function(reportData, ellipsis) {
  const moment = require('moment-timezone');
const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = require('googleapis');
const sheets = google.sheets('v4');
const Report = require('Report');
const report = Report.fromString(reportData);
const categories = require("change-categories");

client.authorize().then(() => {
  return sheets.spreadsheets.values.get({
    spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
    range: ellipsis.env.CHANGE_REQUEST_SHEET_NAME,
    auth: client,
  });
}).then((result) => {
  const rows = result.data.values;
  if (!rows || !rows.length) {
    throw new ellipsis.Error("Couldn't retrieve spreadsheet rows to update: unexpected sheet object.", {
      userMessage: "No rows found in the spreadsheet"
    });
  }
  const matchingRowIndex = rows.findIndex((row) => {
    return row[report.rowIndexOfTimestamp()] === report.timestamp;
  });
  if (matchingRowIndex === -1) {
    throw new ellipsis.Error("Couldn't find matching report in spreadsheet", {
      userMessage: "No matching report was found in the spreadsheet."
    });
  } else {
    const row = rows[matchingRowIndex];
    row[report.rowIndexOfApproved()] = report.approved = "Yes";
    return sheets.spreadsheets.values.append({
      spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
      range: ellipsis.env.CHANGE_REQUEST_APPROVED_SHEET_NAME,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      },
      auth: client
    });
  }
}).then(() => {
  return actionsApi.run({
    actionName: "publishReport",
    channel: ellipsis.env.CHANGE_CONTROL_CHANNEL_ID,
    args: [report.toArg(), {
      name: "status",
      value: "with final approval"
    }]
  });
}).then(() => {
  ellipsis.success("The request has been granted final approval, and it has been published to the change control channel.")
});
}
