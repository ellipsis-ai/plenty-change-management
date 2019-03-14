function(reportData, ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = ellipsis.require('googleapis@36.0.0');
const sheets = google.sheets({
  version: 'v4',
  auth: client
});
const Report = require('Report');
const report = Report.fromString(reportData);
const categories = require('change-categories');

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
    if (/^(y|yes)$/i.test(row[0])) {
      return `:warning: This report has already been approved!`;
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
        return `:sparkles: The report has been initially approved.`;
      }).catch((err) => {
        throw new ellipsis.Error(err, {
          userMessage: "An error occurred while trying to update the spreadsheet to grant initial approval."
        });
      });
    }
  }
}).then((resultText) => {
  const category = categories.find((ea) => ea.name === report.evaluatorGroup);
  if (category) {
    return actionsApi.run({
      actionName: "publishReport",
      channel: category.channel,
      args: [report.toArg(), {
        name: "status",
        value: "awaiting final approval"
      }]
    }).then(() => {
      return `${resultText} The report has been forwarded to ${report.evaluatorGroup} in #${category.channel} for review.`;
    }).catch((err) => {
      throw new ellipsis.Error(err, {
        userMessage: "An error occured while trying to publish the report to the appropriate evaluator group channel."
      });
    });
  } else {
    throw new ellipsis.Error(`No channel found for category ${report.evaluatorGroup}`, {
      userMessage: "An error occured while trying to publish the report to the appropriate evaluator group channel."
    });
  }
}).then((resultText) => {
  ellipsis.success(resultText);
});
}
