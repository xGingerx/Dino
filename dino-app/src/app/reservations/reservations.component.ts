import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../navbar/auth/firebase.service';
import { User } from 'firebase/auth';
import { addDays } from 'date-fns';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {
  url = 'https://dino-eb0j.onrender.com'
  title = 'Reservations';
  user: User | null = null;
  displayName = '';
  email = '';
  slots: { date: string, time: string, reservationCount: number, totalSlots: number, available: boolean, reservedByUser: boolean }[] = [];
  startDate: Date = new Date();
  endDate: Date = addDays(new Date(), 7);
  isLoading: boolean = false;
  readonly slotLimit = 4; 
  public interval: number = 1;
  private messageSubscription: Subscription;

  constructor(private socketService: SocketService, private firebaseService: FirebaseService) {
    this.messageSubscription = this.socketService
      .on('message')
      .subscribe((data) => {
        data = JSON.parse(data);
        Object.keys(data).forEach(date => {          
          Object.entries(data[date]).forEach(([timeSlot, value]) => {
            const slot = this.slots.find(s => s.date === date && s.time === timeSlot);
            if(slot){
              slot.reservationCount = (value as number)
              slot.available = (value as number) < this.slotLimit
            }
          }
        )})
      });
  }

  sendMessage() {
    this.socketService.emit('message', { text: "Updated reservation" });
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  

  ngOnInit(): void {
    const auth = this.firebaseService.getAuth();
    auth.onAuthStateChanged(async user => {
      this.user = user;
      if (user) {
        await this.fetchUserData(user.email!);
        await this.updateAvailableSlotsForRange();
      } else {
        this.displayName = '';
      }
    });
    
  }

  async fetchUserData(email: string) {
    try {
      await fetch(this.url + '/users/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(response=>{
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }).then(data=>{
        localStorage.setItem('user', JSON.stringify(data));
        const storedUser = localStorage.getItem('user');
      if(storedUser) {
        const userObj = JSON.parse(storedUser);
        this.displayName = userObj.displayName;
        this.email = userObj.email;
      }
      })
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  private async updateAvailableSlotsForRange() {
    this.isLoading = true;
    try{
      await fetch(this.url + '/reservations/getActive', {
        method:'GET',
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }).then(data => {
        Object.keys(data).forEach(date => {          
          Object.entries(data[date]).forEach(([timeSlot, value]) => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            const reservations = user.reservations || {};
            const reservedByUser = reservations[date]?.includes(timeSlot);

            let slot = {
              date: date,
              time: timeSlot,
              reservationCount: (value as number),
              totalSlots: this.slotLimit,
              available: (value as number) < this.slotLimit,
              reservedByUser
            }
            this.slots.push(slot)
          });
        });
      })
    } catch(error) {
      console.error('Error fetching reservations:', error);
    }
    this.isLoading = false;
  }

  public async reserveSlot(date: string, time: string) {
    console.log(date)
    if (!this.user) {
      console.error('User not authenticated');
      return;
    }

    const email = this.user.email;
    try {
      await fetch(this.url + '/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time, email }),
      }).then(response=>{
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }).then(data=>{
        console.log(data)
        if(data == "full") {
          const slot = this.slots.find(s => s.date === date && s.time === time);
          if (slot) {
            slot.reservationCount++;  
            slot.available = slot.reservationCount < this.slotLimit;
          }
          alert("Slot is already full, try again!")
        }
        if(data && data != "full") {
          localStorage.setItem('user', JSON.stringify(data));
          const cancelSlot = this.slots.find(s=>s.date === date && s.reservedByUser === true);
          if(cancelSlot){
            cancelSlot.reservedByUser = false;
            cancelSlot.reservationCount--;
            cancelSlot.available = cancelSlot.reservationCount < this.slotLimit;
          }
          
          const slot = this.slots.find(s => s.date === date && s.time === time);
          if (slot) {
            slot.reservedByUser = true;
            slot.reservationCount++;  
            slot.available = slot.reservationCount < this.slotLimit;
          }
        }
        
        this.sendMessage()
      })
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async cancelReservation(date: string, time: string) {
    try {
        const email = this.email;
        console.log(email,"test");
        const requestBody = JSON.stringify({ date, time, email });
        console.log('Sending request:', requestBody);

        const response = await fetch(this.url + '/reservations/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Server response:', data); 
        if(data) {
          localStorage.setItem('user', JSON.stringify(data))
          const slot = this.slots.find(s => s.date === date && s.time === time);
          if(slot) {
            slot.reservedByUser = false;
            slot.reservationCount--;  
            slot.available = slot.reservationCount < this.slotLimit;
          }
        }
        this.sendMessage()
    } catch (error) {
        console.error('Error cancelling reservation:', error);
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
