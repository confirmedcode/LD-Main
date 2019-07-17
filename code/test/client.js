const chai = require("chai");
chai.use(require("chai-http"));
const server = require("../app");

var agent = chai.request.agent(server);

module.exports = {
  
  agent: agent,

  resetAgent: () => {
    if (agent) {
      agent.close();
      agent = chai.request.agent(server);
    }
  },
  
  getUrl: (url, params = {}) => {
    return agent
      .get(url)
      .query(params);
  },
  
  postUrl: (url, params = {}) => {
    return agent
      .post(url)
      .send(params);
  }
  
}

function getContentType(isBrowser) {
  if (isBrowser) {
    return "text/html";
  }
  else {
    return "application/json";
  }
}