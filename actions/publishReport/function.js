function(reportData, status, ellipsis) {
  const Report = require('Report');
const report = Report.fromString(reportData);
ellipsis.success({
  reportText: report.format(),
  followUpUserId: ellipsis.env.CHANGE_CONTROL_MANAGER_USER_ID
});
}
