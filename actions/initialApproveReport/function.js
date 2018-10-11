function(reportData, ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = require('googleapis');
const sheets = google.sheets('v4');
const Report = require('Report');
const report = Report.fromString(reportData);
const categories = require('change-categories');

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
    if (/^(y|yes)$/i.test(row[0])) {
      return `:warning: This report has already been approved! Forwarding to ${report.evaluatorGroup} for review again…`;
    } else {
      const cellId = `${report.columnOfApproved()}${matchingRowIndex + 1}`;
      return sheets.spreadsheets.values.update({
        spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
        range: `${ellipsis.env.CHANGE_REQUEST_SHEET_NAME}!${cellId}:${cellId}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [["Yes"]]
        },
        auth: client
      }).then(() => {
        report.approved = "Yes";
        return `:sparkles: The report has been initially approved. Forwarding to ${report.evaluatorGroup} for review…`;
      });
    }
  }
}).then((resultText) => {
  return actionsApi.say({
    message: resultText
  });
}).then(() => {
  const category = categories.find((ea) => ea.name === report.evaluatorGroup);
  if (category) {
    return actionsApi.run({
      actionName: "publishReport",
      channel: category.channel,
      args: [report.toArg(), {
        name: "status",
        value: "awaiting final approval"
      }]
    });
  } else {
    throw new ellipsis.Error(`No channel found for category ${report.evaluatorGroup}`);
  }
}).then(() => {
  ellipsis.success("Report sent!")
});
}
