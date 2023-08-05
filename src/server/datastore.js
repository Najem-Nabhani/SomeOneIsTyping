class DataStore {
    static storage = {};

    static subscribe(user) {
        const {threadId, sessionId} = user;
        if (!Array.isArray(this.storage[threadId])) {
            this.storage[threadId] = [];
        }

        if (this.findUser(user)) {
            console.log(`user with sessionId: ${sessionId} is already present in thread: ${threadId}`);
            return this.storage[threadId].length;
        }

        console.log(`adding ${sessionId} to thread: ${threadId}`);
        return this.storage[threadId].push(user);
    }

    static unsubscribe(user) {
        const {threadId, sessionId} = user;
        this.storage[threadId] = this.sessionId[threadId].filter(
            (user) => user.sessionId !== sessionId
        );
    }

    static findUser(user) {
        const {threadId, sessionId} = user;
        return this.storage[threadId].find((user) => user.sessionId === sessionId);
    }

    static notifyUsers(threadId, callback) {
        this.storage[threadId].forEach((user) => {
            callback(user);
        });
    }
}

module.exports = DataStore;