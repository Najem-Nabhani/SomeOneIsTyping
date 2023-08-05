1. Talking about Sockets - why?
2. Talking about determining if a user is 'actively' typing.
 -> input box should not be empty
 -> time between next message (client/server should handle this?)

Now how to prevent viewing a typing indicator for the same user? 
3. Unique users, creating a sessionId.
 -> how long should we store the sessionId cookie?
 -> how to read the sessionId value from the cookie in the server side?
 -> compare the typer sessionId on the client side to determine if he/she is the typer. But
  this is not safe as the clinet will know the sessionId of other users if he/she is not the typer.
  Also what about multiple typers?

Up to this point you would have one thread, one typer and one recipent.
4. Scalability:
 -> Scaling the number of threads, adding a path value to determine which thread, because it won't make sense to create a WS per thread.
 -> Scaling the number of typers/recipents, sending a notifications to all connections doesn't make sense now, so we need a way to store 
    the number of users connected to a thread instead of looping over all connections with wsServer.connections.

    IMPLEMENT:
    1. Whenever a new user connects to a thread store the connection in database to a particular threadId.
    2. Whenever a typing notification is recieved, store the typer's sessionId, so a typer doesn't notify themselves.
    3. If 5 seconds have passed and no new notification has been send
