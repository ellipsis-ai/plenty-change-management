/*
@exportId OfsfEMbXS56hWEFs502h3Q
*/
module.exports = (function() {
const url = require('url'); // legacy Node6 url
const semver = require('semver');
class Node6CompatibilityURL {
  constructor(str) {
    this.url = url.parse(str);
    this.origin = this.url.protocol + '//';
    this.pathname = this.url.pathname ? this.url.pathname : '';
    this.search = this.url.search ? this.url.search : '';
    this.href = this.url.href ? this.url.href : '';
  }
}

if (semver.lt(process.version, '6.13.0')) {
  window = {};
  window.URL = Node6CompatibilityURL; // no warranty 😱 
}

return (ellipsis) => {
  const {google} = ellipsis.require('googleapis@36.0.0');
  return new google.auth.JWT({
    email: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/drive'],
    subject: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  });
  
};
})()
     