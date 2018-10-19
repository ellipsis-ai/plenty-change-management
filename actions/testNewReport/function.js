function(ellipsis) {
  const EllipsisApi = require('ellipsis-api');
const Report = require('Report');
const actionsApi = new EllipsisApi(ellipsis).actions;
actionsApi.run({
  actionName: "newReport",
  args: [{
    name: "location",
    value: "SSF - KIT"
  }, {
    name: "team",
    value: "Sensory/Marketing"
  }, {
    name: "problemAndAction",
    value: "A problem and an action"
  }, {
    name: "evaluatorGroup",
    value: "Direct Product Consumables"
  }, {
    name: "riskLevel",
    value: "Medium"
  }, {
    name: "effectiveDate",
    value: "January 1, 2020"
  }, {
    name: "alreadyHappened",
    value: false
  }, {
    name: "file",
    value: "none"
  }, {
    name: "supportingText",
    value: "none"
  }]
}).then(() => {
  ellipsis.success("OK");
});
}
