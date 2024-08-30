import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  // Import RouterModule here
})
export class AppComponent {
  user: User | null = null;

  constructor(private firebaseService: FirebaseService) {
    const auth = this.firebaseService.getAuth();
    auth.onAuthStateChanged(user => {
      this.user = user;
    });
  }

  login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.firebaseService.getAuth(), provider)
      .then((result) => {
        console.log('User signed in:', result.user);
        this.user = result.user;
      })
      .catch((error) => {
        console.error('Error during sign-in:', error);
      });
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
}
