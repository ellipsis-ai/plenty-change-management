function(location, team, problemAndAction, evaluatorGroup, riskLevel, date, alreadyHappened, file, supportingText, ellipsis) {
  const box = require('ellipsis-box');
const moment = require('moment-timezone');
const Report = require('Report');

uploadFile().then((fileInfo) => {
  const report = new Report({
    reporterId: ellipsis.userInfo.messageInfo.userId,
    reporterName: ellipsis.userInfo.fullName,
    reporterEmail: ellipsis.userInfo.email,
    location: location.id,
    team: team.id,
    problemAndAction: problemAndAction,
    evaluatorGroup: evaluatorGroup.id,
    riskLevel: riskLevel.id,
    date: moment(date).format("YYYY-MM-DD"),
    alreadyHappened: alreadyHappened ? "Yes" : "No",
    supportingUrl: fileInfo ? fileInfo.url : "(none)",
    supportingText: supportingText
  });
  ellipsis.success(report.format(), {
    choices: [{
      label: "Submit for approval",
      actionName: "saveReport",
      args: [report.toArg()]
    }, {
      label: "Start over",
      actionName: "newReport"
    }]
  });
});

function uploadFile() {
  return new Promise((resolve, reject) => {
    if (file) {
      file.fetch().then(fetchResult => {
        return box.files(ellipsis).uploadWithTimestamp(fetchResult.filename, fetchResult.contentType, fetchResult.value).then(uploadResult => {
          resolve({ url: uploadResult.downloadUrl, filename: fetchResult.filename });
        });
      });
    } else {
      resolve(null); 
    }
  });
}
}
