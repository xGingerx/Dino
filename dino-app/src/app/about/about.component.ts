import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, setDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { FirebaseService } from '../navbar/auth/firebase.service';
import { Auth, User } from 'firebase/auth';
import { format, addDays, isToday, isWithinInterval } from 'date-fns';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  title = 'About';
  user: User | null = null;
  displayName = '';
  slots: { date: string, time: string, reservationCount: number, totalSlots: number, available: boolean, reservedByUser: boolean }[] = [];
  startDate: Date = new Date();
  endDate: Date = addDays(new Date(), 7);
  readonly slotLimit = 4; // Limit for each time slot

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    this.initializeUser();
    await this.updateAvailableSlotsForRange();
  }

  private initializeUser() {
    const auth = this.firebaseService.getAuth();
    auth.onAuthStateChanged(async user => {
      this.user = user;
      if (this.user) {
        await this.fetchUserData(this.user.email!);
        await this.updateAvailableSlotsForRange(); // Ensure slots are updated after user login
      } else {
        this.displayName = '';
      }
    });
  }

  private async fetchUserData(email: string) {
    try {
      const db = this.firebaseService.getFirestore();
      const userRef = doc(db, 'users', email);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        this.displayName = userData?.['displayName'] || '';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  private async updateAvailableSlotsForRange() {
    const dates = this.getDatesInRange(this.startDate, this.endDate);
    
    // Flatten the nested arrays
    const slots = (await Promise.all(dates.map(async (date) => {
      const formattedDate = format(date, 'd-M-yyyy');
      const timeSlots = ['10-13', '13-16', '16-19', '19-22'];
  
      return Promise.all(timeSlots.map(async (time) => {
        const slotRef = collection(this.firebaseService.getFirestore(), `reservations/${formattedDate}/${time}`);
        const tempRef = doc(slotRef, 'temp');
        const slotSnap = await getDoc(tempRef);
  
        const reservationsSnap = await getDocs(query(slotRef, where('reservedBy', '!=', '')));
  
        const reservedByUser = this.user ? (await getDocs(query(slotRef, where('reservedBy', '==', this.user.email!)))).size > 0 : false;
  
        return {
          date: formattedDate,
          time,
          reservationCount: reservationsSnap.size,
          totalSlots: this.slotLimit,
          available: reservationsSnap.size < this.slotLimit,
          reservedByUser
        };
      }));
    }))).flat(); // Flatten the nested array
  
    this.slots = slots;
  }
  

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    let currentDate = startDate;
    while (isWithinInterval(currentDate, { start: startDate, end: endDate })) {
      if (!isToday(currentDate)) {
        dates.push(currentDate);
      }
      currentDate = addDays(currentDate, 1);
    }
    return dates;
  }

  public async reserveSlot(date: string, time: string) {
    if (!this.user) {
      console.error('User not authenticated');
      return;
    }

    const db = this.firebaseService.getFirestore();
    const slotRef = collection(db, `reservations/${date}/${time}`);
    const userDocRef = doc(db, 'users', this.user.email!);

    try {
      const reservationsSnap = await getDocs(slotRef);
      const reservationCount = reservationsSnap.size;

      if (reservationCount >= this.slotLimit) {
        console.log('No available slots');
        return;
      }

      const userSnap = await getDoc(userDocRef);
      const userReservations = userSnap.data()?.['reservations'] || {};
      const existingReservation = userReservations[date];

      if (existingReservation) {
        await this.cancelReservation(existingReservation.date, existingReservation.time);
      }

      await setDoc(userDocRef, {
        reservations: {
          [date]: { time, date }
        }
      }, { merge: true });

      const reservationRef = doc(db, `reservations/${date}/${time}`, this.user.email!);
      await setDoc(reservationRef, { reservedBy: this.user.email, reservationTime: new Date() });

      const tempRef = doc(db, `reservations/${date}/${time}/temp`);
      await deleteDoc(tempRef);

      await this.updateAvailableSlotsForRange();
    } catch (error) {
      console.error('Error reserving or canceling slot:', error);
    }
  }

  public async cancelReservation(date: string, time: string) {
    const db = this.firebaseService.getFirestore();
    const slotRef = doc(db, `reservations/${date}/${time}`, this.user!.email!);
    const userDocRef = doc(db, 'users', this.user!.email!);

    try {
      await deleteDoc(slotRef);

      const userSnap = await getDoc(userDocRef);
      const userReservations = userSnap.data()?.['reservations'] || {};
      const updatedReservations = { ...userReservations };
      delete updatedReservations[date];

      await setDoc(userDocRef, {
        reservations: updatedReservations
      }, { merge: true });

      const tempRef = doc(db, `reservations/${date}/${time}/temp`);
      await setDoc(tempRef, {});

      await this.updateAvailableSlotsForRange();
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  }

  public isSlotReserved(date: string, time: string): boolean {
    const slot = this.slots.find(slot => slot.date === date && slot.time === time);
    return slot ? slot.reservedByUser : false;
  }

  public isSlotAvailable(date: string, time: string): boolean {
    const slot = this.slots.find(slot => slot.date === date && slot.time === time);
    return slot ? slot.available : false;
  }
}
