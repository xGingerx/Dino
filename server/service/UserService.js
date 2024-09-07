const User = require('../entity/user');
const { query, where, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, dbReservations, dbUsers } = require('../firebase/firebase');

class UserService {
  static async findOrCreateUser(userData) {
    try {
      const q = query(dbUsers, where('email', '==', userData.email));
      const querySnapshot = await getDocs(q);

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

        const newUserRef = doc(dbUsers, newUser.email);
        await setDoc(newUserRef, {
          email: newUser.email,
          displayName: newUser.displayName,
          uid: newUser.uid,
          photoURL: newUser.photoURL,
          createdAt: newUser.createdAt,
          reservations: newUser.reservations
        });

        const newUserDoc = await getDoc(newUserRef);
        return { ...newUserDoc.data() };
      }
    } catch (error) {
      console.error("Error finding or creating user:", error);
      throw error;
    }
  }

  // Fetch user by email
  static async getUserByEmail(email) {
    try {
      const q = query(dbUsers, where("email", "==", email)); // Create query for email
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`No user found with email ${email}.`);
        return null;
      }

      let userData = null;
      querySnapshot.forEach(doc => {
        userData = { id: doc.id, ...doc.data() };
      });

      return userData;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  }

  static async updateUser(email, displayName, photoURL) {
    try {
      const userDocRef = doc(dbUsers, email); // Use doc() to get a reference by email

      // Prepare update data
      const updateData = {
        displayName
      };

      // If photoURL is provided, add it to the update data
      if (photoURL) {
        updateData.photoURL = photoURL;
      }

      // Update the user data in the database
      await updateDoc(userDocRef, updateData);

      // Return updated data
      const updatedUserSnapshot = await getDoc(userDocRef);
      return updatedUserSnapshot.data();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updateReservation(date, time, email) {
    try {
      const q = query(dbUsers, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`User with email ${email} does not exist`);
      }

      let user = {};
      querySnapshot.forEach(doc => {
        user = { ...doc.data() };
      });

      user.reservations = user.reservations || {};
      user.reservations[date] = time;

      // Update the user data in the database
      const userDocRef = doc(dbUsers, email);
      await updateDoc(userDocRef, { reservations: user.reservations });

      return user;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  static async cancelReservation(date, time, email) {
    try {
      const q = query(dbUsers, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`User with email ${email} does not exist`);
      }

      let user = {};
      querySnapshot.forEach(doc => {
        user = { ...doc.data() };
      });

      user.reservations = user.reservations || {};
      delete user.reservations[date];

      // Update the user data in the database
      const userDocRef = doc(dbUsers, email);
      await updateDoc(userDocRef, { reservations: user.reservations });

      return user;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  }
}

module.exports = UserService;
