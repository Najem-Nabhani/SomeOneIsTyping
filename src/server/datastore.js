class DataStore {
    static storage = {};

    static subscribe(user) {
        const {threadId, sessionId} = user;
        if (!Array.isArray(this.storage[threadId])) {
            this.storage[threadId] = [];
        }

        if (this.findUser(threadId, sessionId)) {
            console.log(`user with sessionId: ${sessionId} is already present in thread: ${threadId}`);
            return this.storage[threadId].length;
        }

        console.log(`adding ${sessionId} to thread: ${threadId}`);
        return this.storage[threadId].push(user);
    }

    static unsubscribe(user) {
        const {threadId, sessionId} = user;
        this.storage[threadId] = this.storage[threadId].filter(
            (user) => user.sessionId !== sessionId
        );
        console.log(`removing ${sessionId} from thread: ${threadId}`);
    }

    static findUser(threadId, sessionId) {
        return this.storage[threadId].find((user) => user.sessionId === sessionId);
    }

    static notifyUsers(threadId, callback) {
        this.storage[threadId].forEach((user) => {
            callback(user);
        });
    }
}

module.exports = DataStore;