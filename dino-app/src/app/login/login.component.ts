import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FirebaseService } from './auth/firebase.service';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc } from "firebase/firestore";

@Component({
    selector: 'app-login',
    standalone: true,
    imports:[CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent{
    title='login'
    user: User | null = null;

    constructor(private firebaseService: FirebaseService) {
        const auth = this.firebaseService.getAuth();
        auth.onAuthStateChanged(user => {
        this.user = user;
        });
    }

    async login() {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(this.firebaseService.getAuth(), provider);
          this.user = result.user;
    
          console.log('User signed in:', this.user);
    
          // Create a user document in Firestore if it doesn't already exist
          const db = this.firebaseService.getFirestore(); // Get Firestore instance
          const userRef = doc(db, 'users', this.user.email!); // Reference to the document
    
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            // Document doesn't exist, create it
            await setDoc(userRef, {
              email: this.user.email,
              displayName: this.user.displayName,
              uid: this.user.uid,
              photoURL: this.user.photoURL,
              createdAt: new Date()
            });
            console.log('User document created in Firestore');
          } else {
            console.log('User document already exists in Firestore');
          }
        } catch (error) {
          console.error('Error during sign-in:', error);
        }
      }
    
      logout() {
        this.firebaseService.getAuth().signOut()
          .then(() => {
            console.log('User signed out');
            this.user = null;
          })
          .catch((error) => {
            console.error('Error during sign-out:', error);
          });
      }
    
      isUserLoggedIn(): boolean {
        return this.user !== null;
      }
    
};