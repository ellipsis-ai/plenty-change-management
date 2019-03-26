function(reportData, ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = ellipsis.require('googleapis@38.0.0');
const sheets = google.sheets({
  version: 'v4',
  auth: client
});
const Report = require('Report');
const report = Report.fromString(reportData);
const categories = require("change-categories");
const sheetsUtils = require('sheets-utils')(ellipsis);

client.authorize().then(() => {
  return sheets.spreadsheets.values.get({
    spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
    range: ellipsis.env.CHANGE_REQUEST_SHEET_NAME,
    auth: client,
  }).catch((err) => {
    throw new ellipsis.Error(err, {
      userMessage: "An error occurred while trying to read the change request spreadsheet."
    });
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
    return sheetsUtils.insertRowInSheet(ellipsis.env.CHANGE_REQUEST_SHEET_ID, ellipsis.env.CHANGE_REQUEST_APPROVED_SHEET_NAME, 1, client)
      .then(() => sheets.spreadsheets.values.append({
        spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
        range: `${ellipsis.env.CHANGE_REQUEST_APPROVED_SHEET_NAME}!A2:Z2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row]
        },
        auth: client
    })).catch((err) => {
      throw new ellipsis.Error(err, {
        userMessage: "An error occurred while trying to save the report to the Approved spreadsheet."
      });
    });
  }
}).then(() => {
// Final report publish disabled by request
//   return actionsApi.run({
//     actionName: "publishReport",
//     channel: ellipsis.env.CHANGE_CONTROL_CHANNEL_ID,
//     args: [report.toArg(), {
//       name: "status",
//       value: "with final approval"
//     }]
//   }).catch((err) => {
//     throw new ellipsis.Error(err, {
//       userMessage: `An error occurred while trying to publish the report to the change control channel <#${ellipsis.env.CHANGE_CONTROL_CHANNEL_ID}>.`
//     });
//   });
// }).then(() => {
//  ellipsis.success(`The request has been granted final approval, and it has been published to the change control channel <#${ellipsis.env.CHANGE_CONTROL_CHANNEL_ID}>.`);
  ellipsis.success(`The request has been granted final approval.`);
});
}
