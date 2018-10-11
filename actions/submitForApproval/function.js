function(reportData, ellipsis) {
  const Report = require('Report');

const report = Report.fromString(reportData);
ellipsis.success(report.format(), {
  choices: [{
    label: "Grant initial approval",
    actionName: "initialApproveReport",
    args: [report.toArg()],
    allowMultipleSelections: true,
    allowOthers: true
  }, {
    label: "Grant final approval",
    actionName: "finalApproveReport",
    args: [report.toArg()],
    allowMultipleSelections: true,
    allowOthers: true
  }]
});
}
