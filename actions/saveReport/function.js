function(reportData, ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const actionsApi = new EllipsisApi(ellipsis).actions;
const client = require('google-client')(ellipsis);
const {google} = require('googleapis');
const sheets = google.sheets('v4');
const moment = require('moment-timezone');
const Report = require('Report');

const timestamp = moment.tz(ellipsis.teamInfo.timeZone).format("MMMM D YYYY, h:mm:ss a");
const report = Report.fromString(reportData);
report.approved = "No";
report.timestamp = timestamp;
const values = [report.toRow()];

client.authorize().then(() => {
  return sheets.spreadsheets.values.append({
    spreadsheetId: ellipsis.env.CHANGE_REQUEST_SHEET_ID,
    range: ellipsis.env.CHANGE_REQUEST_SHEET_NAME,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: values
    },
    auth: client
  });
}).then((res) => {
  const updated = res.data.updates.updatedRows;
  if (updated == 0) {
    ellipsis.error(`The report was not saved. No rows were updated.`);
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
