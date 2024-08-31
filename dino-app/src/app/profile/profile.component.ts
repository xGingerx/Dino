import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirebaseService } from '../navbar/auth/firebase.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, RouterOutlet, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  displayName: string = '';
  photoURL: string = '';
  email: string = '';

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async ngOnInit() {
    const auth = this.firebaseService.getAuth();
    
    // Use onAuthStateChanged to get the user when they sign in
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        this.email = user.email || '';
        this.displayName = user.displayName || '';
        this.photoURL = user.photoURL || '';

        // Fetch the user's document from Firestore
        const db = this.firebaseService.getFirestore();
        const userDocRef = doc(db, 'users', this.email);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          this.displayName = userData['displayName'];
          this.photoURL = userData['photoURL'];
          console.log('User data loaded:', this.displayName, this.photoURL);
        } else {
          console.log('User document does not exist.');
        }
      } else {
        console.log('No user signed in, redirecting to login');
        this.router.navigate(['/']);
      }
    });
  }

  async saveChanges() {
    if (this.user) {
      try {
        // Update Firestore document only
        const db = this.firebaseService.getFirestore();
        const userDocRef = doc(db, 'users', this.email);
        await updateDoc(userDocRef, {
          displayName: this.displayName,
          photoURL: this.photoURL,
        });

        console.log('Profile updated successfully in Firestore');
      } catch (error) {
        console.error('Error updating profile in Firestore:', error);
      }
    }
  }
}
