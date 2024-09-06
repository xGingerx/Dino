const User = require('../entity/user');
const { dbUsers } = require('../firebase/firebase');

class UserService {
  static async findOrCreateUser(userData) {
    try {
      const querySnapshot = await dbUsers.where('email', '==', userData.email).get();

      if (!querySnapshot.empty) {
        let existingUser = {};
        querySnapshot.forEach(doc => {
          existingUser = { ...doc.data() };
        });
        return existingUser;
      } else {
        const newUser = new User(
          userData.email,
          userData.displayName,
          userData.uid,
          userData.photoURL
        );
        
        const newUserRef = dbUsers.doc(newUser.email);
        await newUserRef.set({
          email: newUser.email,
          displayName: newUser.displayName,
          uid: newUser.uid,
          photoURL: newUser.photoURL,
          createdAt: newUser.createdAt,
          reservations: newUser.reservations
        });

        const newUserDoc = await newUserRef.get();
        return { ...newUserDoc.data() };
      }
    } catch (error) {
      console.error("Error finding or creating user:", error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const querySnapshot = await dbUsers.where('email', '==', email).get();

      if (!querySnapshot.empty) {
        let user = {};
        querySnapshot.forEach(doc => {
          user = { ...doc.data() };
        });
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  static async updateUser(user){
        try{
            const querySnapshot = await dbUsers.where('email', '==', user.email).get();
            if (querySnapshot.empty) {
                throw new Error(`User with email ${email} does not exist`);
            }
            const doc = querySnapshot.docs[0];
            const userDocId = doc.id;
            const userRef = dbUsers.doc(userDocId);
            await userRef.update(user) 
            const updatedUserDoc = await userRef.get();
            return updatedUserDoc.data()        
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    static async updateUserByEmail(email, reservation){
      try{
          const querySnapshot = await dbUsers.where('email', '==', email).get();
          if (querySnapshot.empty) {
              throw new Error(`User with email ${email} does not exist`);
          }
          const doc = querySnapshot.docs[0];
          const userDocId = doc.id;
          const userRef = dbUsers.doc(userDocId);
          await userRef.update(user) 
          const updatedUserDoc = await userRef.get();
          return updatedUserDoc.data()        
      } catch (error) {
          console.error("Error updating user:", error);
          throw error;
      }
  }

    static async deleteUserByEmail(email) {
        console.log(email)
        try {
          const querySnapshot = await dbUsers.where('email', '==', email).get();
          if (querySnapshot.empty) {
            throw new Error(`User with email ${email} does not exist`);
          }
          const doc = querySnapshot.docs[0];
          const userDocId = doc.id;
          const userRef = dbUsers.doc(userDocId);
          await userRef.delete();          
        } catch (error) {
          console.error("Error deleting user:", error);
          throw error;
        }
      }

    static async updateReservation(date, time, email){
      const querySnapshot = await dbUsers.where('email', '==', email).get();
      if (querySnapshot.empty) {
        throw new Error(`User with email ${email} does not exist`);
      }
      let user = {};
      querySnapshot.forEach(doc => {
        user = { ...doc.data() };
      });
      user.reservations[date] = time;
      return user;
    }
    static async cancelReservation(date, time, email){
      const querySnapshot = await dbUsers.where('email', '==', email).get();
      if (querySnapshot.empty) {
        throw new Error(`User with email ${email} does not exist`);
      }
      let user = {};
      querySnapshot.forEach(doc => {
        user = { ...doc.data() };
      });
      delete user.reservations[date];
      return user;
    }
}

module.exports = UserService;
