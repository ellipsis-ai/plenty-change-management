function(reportData, ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = ellipsis.require('googleapis@38.0.0');
const sheets = google.sheets({
  version: 'v4',
  auth: client
});
const moment = require('moment-timezone');
const Report = require('Report');
const sheetsUtils = require('sheets-utils')(ellipsis);

const SAVE_ERROR_MESSAGE = `An error occurred while trying to save your report. Please notify <@${ellipsis.env.CHANGE_CONTROL_MANAGER_USER_ID}>.`;
const report = Report.fromString(reportData);
report.approved = "No";
const now = moment.tz(ellipsis.teamInfo.timeZone);
report.timestamp = now.format("MMMM D YYYY, h:mm:ss a");
report.reportDate = now.format(Report.dateFormat());
client.authorize()
.then(() => sheetsUtils.insertRowInSheet(ellipsis.env.CHANGE_REQUEST_SHEET_ID, ellipsis.env.CHANGE_REQUEST_SHEET_NAME, 1, client))
.then(() => sheets.spreadsheets.values.append({
  spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
  range: `${ellipsis.env.CHANGE_REQUEST_SHEET_NAME}!A2:Z2`,
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [report.toRow()]
  },
  auth: client
})).catch((err) => {
  throw new ellipsis.Error(err, {
    userMessage: SAVE_ERROR_MESSAGE
  });
}).then((res) => {
  const updated = res.data.updates.updatedRows;
  if (updated === 0) {
    throw new ellipsis.Error("Report was not saved. No rows were updated.", {
      userMessage: SAVE_ERROR_MESSAGE
    });
  } else {
    actionsApi.run({
      actionName: "submitForApproval",
      args: [report.toArg()],
      channel: ellipsis.env.CHANGE_APPROVAL_CHANNEL_ID
    }).then(() => {
      ellipsis.success(`Fantastic. Your report has been saved.`);
    }).catch(() => {
      ellipsis.error(`Failed while submitting report for approval to channel ID ${ellipsis.env.CHANGE_CONTROL_CHANNEL_ID}`, {
        userMessage: `Your report has been saved, but there was a problem notifying the change control manager, <@${ellipsis.env.CHANGE_CONTROL_MANAGER_USER_ID}>.`
      });
    });
  }
});
}
