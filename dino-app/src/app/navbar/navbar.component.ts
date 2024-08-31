import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './auth/firebase.service'; // Adjust the path if needed
import { Auth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  displayName: string = '';

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const auth = this.firebaseService.getAuth();
    auth.onAuthStateChanged(async user => {
      this.user = user;
      if (this.user) {
        await this.fetchUserData(this.user.email!);
      } else {
        this.displayName = '';
      }
    });
  }

  async fetchUserData(email: string) {
    try {
      const db = this.firebaseService.getFirestore();
      const userRef = doc(db, 'users', email);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        this.displayName = userData['displayName'] || '';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async login() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseService.getAuth(), provider);
      this.user = result.user;
      this.displayName = this.user.displayName || '';

      console.log('User signed in:', this.user);

      // Create a user document in Firestore if it doesn't already exist
      const db = this.firebaseService.getFirestore();
      const userRef = doc(db, 'users', this.user.email!);

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
        this.displayName = '';
        this.router.navigate(['/']); // Redirect to login or home page
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
      });
  }

  isUserLoggedIn(): boolean {
    return this.user !== null;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
