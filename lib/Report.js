/*
@exportId 7SG_rIyRSRCqwt7XTZTzlQ
*/
module.exports = (function() {
class Report {
  constructor(data) {
    this.approved = data.approved;
    this.timestamp = data.timestamp;
    this.reporterName = data.reporterName;
    this.reporterEmail = data.reporterEmail;
    this.reporterId = data.reporterId;
    this.location = data.location;
    this.team = data.team;
    this.problemAndAction = data.problemAndAction;
    this.evaluatorGroup = data.evaluatorGroup;
    this.riskLevel = data.riskLevel;
    this.date = data.date;
    this.alreadyHappened = data.alreadyHappened;
    this.supportingUrl = data.supportingUrl;
    this.supportingText = data.supportingText;
  }

  static fromString(jsonString) {
    return new Report(JSON.parse(jsonString));
  }

  toRow() {
    return [
      this.approved,
      this.timestamp,
      this.reporterName,
      this.reporterEmail,
      this.reporterId,
      this.location,
      this.team,
      this.problemAndAction,
      this.evaluatorGroup,
      this.riskLevel,
      this.date,
      this.alreadyHappened,
      this.supportingUrl,
      this.supportingText
    ];
  }

  rowIndexOfTimestamp() {
    return 1;
  }

  rowIndexOfApproved() {
    return 0;
  }

  columnOfApproved() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(this.rowIndexOfApproved());
  }

  toString() {
    return JSON.stringify(this);
  }

  toArg() {
    return {
      name: "reportData",
      value: this.toString()
    };
  }

  format() {
    return `
${this.timestamp ? `**Submitted:** ${this.timestamp}
` : ""}
**Reporter:** <@${this.reporterId}>
**Location:** ${this.location}
**Team:** ${this.team}

**Problem and action requested:**
${this.problemAndAction}

**Evaluator group:** ${this.evaluatorGroup}
**Risk level:** ${this.riskLevel}
**Effective date:** ${this.date}
**Did it already happen:** ${this.alreadyHappened}

**Supporting file:** ${this.supportingUrl}
**Other supporting evidence:**
${this.supportingText}
  `;
  }
}

return Report;
})()
     