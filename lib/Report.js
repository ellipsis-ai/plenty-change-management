/*
@exportId 7SG_rIyRSRCqwt7XTZTzlQ
*/
module.exports = (function() {
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SHEET_COLUMN_INDEXES = ALPHABET.concat(ALPHABET.map((ea) => "A" + ea));

class Report {
  constructor(data) {
    this.approved = data.approved;
    this.reportDate = data.reportDate;
    this.timestamp = data.timestamp;
    this.reporterName = data.reporterName;
    this.reporterEmail = data.reporterEmail;
    this.reporterId = data.reporterId;
    this.location = data.location;
    this.team = data.team;
    this.problemAndAction = data.problemAndAction;
    this.evaluatorGroup = data.evaluatorGroup;
    this.riskLevel = data.riskLevel;
    this.effectiveDate = data.effectiveDate;
    this.alreadyHappened = data.alreadyHappened;
    this.supportingUrl = data.supportingUrl;
    this.supportingText = data.supportingText;
  }

  static fromString(jsonString) {
    return new Report(JSON.parse(jsonString));
  }

  static dateFormat() {
    return "M/D/YYYY";
  }

  static timestampFormat() {
    return "MMMM D YYYY, h:mm:ss a";
  }

  toRow() {
    return [
      this.approved,
      this.reportDate,
      this.reporterName,
      this.reporterEmail,
      this.reporterId,
      this.location,
      this.team,
      this.problemAndAction,
      this.evaluatorGroup,
      this.riskLevel,
      this.effectiveDate,
      this.alreadyHappened,
      this.supportingUrl,
      this.supportingText,
      this.timestamp,
    ];
  }

  rowIndexOfTimestamp() {
    const timestamp = Date.now();
    return new Report({ timestamp: timestamp }).toRow().indexOf(timestamp);
  }

  rowIndexOfApproved() {
    const approved = "no";
    return new Report({ approved: approved }).toRow().indexOf(approved);
  }

  columnOfApproved() {
    return SHEET_COLUMN_INDEXES[this.rowIndexOfApproved()];
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
${this.timestamp ? `**Report date:** ${this.reportDate}
` : ""}
**Reporter:** <@${this.reporterId}>
**Location:** ${this.location}
**Team:** ${this.team}

**Problem and action requested:**
${this.problemAndAction}

**Evaluator group:** ${this.evaluatorGroup}
**Risk level:** ${this.riskLevel}
**Effective date:** ${this.effectiveDate}
**Did it already happen:** ${this.alreadyHappened}

**Supporting file:** ${this.supportingUrl}
**Other supporting evidence:**
${this.supportingText}
  `;
  }
}

return Report;
})()
     