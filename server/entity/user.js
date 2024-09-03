class User {
    constructor(email, displayName, uid, photoURL) {
        this.email = email;
        this.displayName = displayName;
        this.uid = uid;
        this.photoURL = photoURL;
        this.createdAt = new Date();
        this.reservations = {}
    }
}

module.exports = User;