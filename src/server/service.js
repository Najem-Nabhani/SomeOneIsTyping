const WebSocket = require('websocket').server;
const http = require('http');
const url = require('url');
const datastore = require('./datastore');

const server = http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Content-Type': 'application/json'
  };

  // Fake Authentication
  if (req.url.match(/^\/auth/) && req.method === 'GET') {
    // Create random sessionId
    sessionId = Math.random().toString(36).substring(2, 15);

    res.writeHead(200, headers);
    res.write(JSON.stringify({sessionId}));
    res.end();
    return;
  }

  res.writeHead(405, headers);
  res.end(`${req.method} is not allowed for the request.`);
});

const wsServer = new WebSocket({
    httpServer: server
});

wsServer.on('request', (request) => {
  const {sessionId, threadId} = url.parse(request.resourceURL)?.query;

  if (!threadId) {
    request.reject(400, 'Request does not contain a valid thread id');
    return;
  }
  
  if (sessionId === 'null' || !sessionId) {
    console.log('rejected connecting to', sessionId);
    request.reject(401, 'Unauthorized user');
    return;
  }
 
  const connection = Object.assign(request.accept(null, request.origin), {sessionId, threadId, isTyping: false, noOfUsersTyping: 0});

  datastore.subscribe(connection);

  let intervalId;
  connection.on('message', (message) => {
    const {action, threadId, sessionId} = JSON.parse(message.utf8Data);
    if (action === 'typing') {
      displayTypingIndicator(threadId, sessionId);
      clearInterval(intervalId);
      intervalId = setTimeout(() => hideTypingIndicator(threadId, sessionId), 5000);
    }

    if (action === 'stopTyping') {
      hideTypingIndicator(threadId, sessionId);
      clearInterval(intervalId);
    }
  });

});

function displayTypingIndicator(threadId, sourceSessionId) {
  const sourceUser = datastore.findUser(threadId, sourceSessionId);
  if (sourceUser.isTyping) {
    return;
  }

  sourceUser.isTyping = true;
  datastore.notifyUsers(threadId, (user) => {
    if (user.sessionId !== sourceSessionId) {
      user.noOfUsersTyping += 1;
      user.send(JSON.stringify({action: 'display-typing-indicator'}));
    }
  });
}

function hideTypingIndicator(threadId, sourceSessionId) {
  const sourceUser = datastore.findUser(threadId, sourceSessionId);
  if (!sourceUser.isTyping) {
    return;
  }

  sourceUser.isTyping = false;
  datastore.notifyUsers(threadId, (user) => {
    if (user.sessionId !== sourceSessionId) {
      // the number of users typing shouldn't become negative
      user.noOfUsersTyping = Math.max(0, user.noOfUsersTyping-1);

      if (user.noOfUsersTyping === 0) {
        user.send(JSON.stringify({action: 'hide-typing-indicator'}));
      }
    }
  });
}

wsServer.on('close', (closedConnection) => {
  datastore.unsubscribe(closedConnection);
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
