import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { FirebaseService } from '../navbar/auth/firebase.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { NavbarComponent } from '../navbar/navbar.component';
import { format } from 'date-fns';

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
  reservations: { date: string, time: string }[] = []; // Store user reservations

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async ngOnInit() {
    const auth = this.firebaseService.getAuth();
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        this.email = user.email || '';
        this.displayName = user.displayName || '';
        this.photoURL = user.photoURL || '';

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

        await this.loadUserReservations();
      } else {
        console.log('No user signed in, redirecting to login');
        this.router.navigate(['/']);
      }
    });
  }

  async loadUserReservations() {
    if (this.user) {
      try {
        const db = this.firebaseService.getFirestore();
        const userDocRef = doc(db, 'users', this.email);
        const userDocSnap = await getDoc(userDocRef);
        const userReservations = userDocSnap.data()?.['reservations'] || {};

        this.reservations = Object.values(userReservations).map((res: any) => ({
          date: res.date,
          time: res.time
        }));

        console.log('User reservations loaded:', this.reservations);
      } catch (error) {
        console.error('Error loading user reservations:', error);
      }
    }
  }

  async removeReservation(date: string, time: string) {
    if (this.user) {
      try {
        const db = this.firebaseService.getFirestore();
        const userDocRef = doc(db, 'users', this.email);
        const reservationRef = doc(db, `reservations/${date}/${time}`, this.user.email!);

        // Delete reservation from user's document
        const userDocSnap = await getDoc(userDocRef);
        const userReservations = userDocSnap.data()?.['reservations'] || {};
        delete userReservations[date];
        await updateDoc(userDocRef, {
          reservations: userReservations
        });

        // Delete reservation from the slot
        await deleteDoc(reservationRef);

        console.log('Reservation removed successfully.');

        // Reload reservations
        await this.loadUserReservations();
      } catch (error) {
        console.error('Error removing reservation:', error);
      }
    }
  }

  async saveChanges() {
    if (this.user) {
      try {
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
