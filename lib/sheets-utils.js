/*
@exportId IMf2P022Ryubiaeys8kJrw
*/
module.exports = (function() {
return (ellipsis) => {
  const client = require('google-client')(ellipsis);
  const {google} = ellipsis.require('googleapis@36.0.0');
  const sheets = google.sheets({
    version: 'v4',
    auth: client
  });
  const utils = {
    sheetIdFor: function(spreadsheetId, sheetName, client) {
      return sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        ranges: [],
        includeGridData: false,
        auth: client
      }).then((res) => {
        const sheet = res.data.sheets.find((sheet) => sheet.properties.title === sheetName);
        const sheetId = sheet ? sheet.properties.sheetId : null;
        if (typeof sheetId !== 'number') {
          throw new Error(`No sheet found named "${sheetName}" in spreadsheet ID ${spreadsheetId}`);
        }
        return Promise.resolve(sheetId);
      });
    },
    insertRowInSheet: function(spreadsheetId, sheetName, startIndex, client) {
      return utils.sheetIdFor(spreadsheetId, sheetName, client)
        .then((sheetId) => sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          resource: {
            requests: [{
              insertDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: "ROWS",
                  startIndex: startIndex,
                  endIndex: startIndex + 1
                },
                inheritFromBefore: false
              }
            }],
          },
          auth: client
        }));
    }
  };
  return utils;
}
})()
     