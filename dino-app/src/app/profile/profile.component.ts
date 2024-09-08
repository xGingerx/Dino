import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
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
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async ngOnInit() {
    const auth = this.firebaseService.getAuth();
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await this.fetchUserData(user.email!);
      
      } else {
        console.log('No user signed in, redirecting to login');
        this.router.navigate(['/']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async fetchUserData(email: string) {
    try {
      await fetch('http://localhost:3000/users/get', {
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
        console.log(storedUser);
      if(storedUser) {
        const userObj = JSON.parse(storedUser);
        this.displayName = userObj.displayName;
        this.email = userObj.email;
        this.photoURL = userObj.photoURL;
        for (const key in userObj.reservations) {
            this.reservations.push({
              date: userObj.reservations[key].date,
              time: userObj.reservations[key].time
            })
        }
      }
      })
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async cancelReservation(date: string, time: string) {
    try {
        const email = this.email;
        const requestBody = JSON.stringify({ date, time, email });
        console.log('Sending request:', requestBody);  // Proveri JSON koji se šalje

        // Pošalji zahtev za brisanje rezervacije
        const response = await fetch('http://localhost:3000/reservations/delete', {
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
        console.log('Server response:', data);  // Proveri odgovor servera

        // Ukloni rezervaciju iz localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);

            // Proveri da li rezervacije postoje za dati datum
            if (userObj.reservations && userObj.reservations[date]) {
                // Ukloni rezervaciju za određeni vremenski interval
                delete userObj.reservations[date];  // Ukloni sve rezervacije za taj datum
                // Ako je potrebno, možeš dodati kod za uklanjanje samo specifične vremenske intervale
                // delete userObj.reservations[date][time]; // Ako želiš da ukloniš samo specifični vremenski interval
            }

            // Ažuriraj localStorage
            localStorage.setItem('user', JSON.stringify(userObj));
        }

        // Ukloni rezervaciju iz UI-a
        this.reservations = this.reservations.filter(
            reservation => reservation.date !== date || reservation.time !== time
        );

    } catch (error) {
        console.error('Error cancelling reservation:', error);
    }
}

async saveChanges() {
  this.isLoading = true;
  try {
    const email = this.email;
    let photoURL = this.photoURL;

    if (this.selectedFile) {
      // Upload image and get the URL
      const uploadResponse = await fetch('http://localhost:3000/users/uploadImage', {
        method: 'POST',
        body: this.createFormData(this.selectedFile, email), 
      });

      if (!uploadResponse.ok) {
        throw new Error('Image upload failed');
      }

      const uploadData = await uploadResponse.json();
      photoURL = uploadData.photoURL;
    }

    const requestBody = JSON.stringify({
      email,
      displayName: this.displayName,
      photoURL
    });

    console.log('Sending request:', requestBody);

    const response = await fetch('http://localhost:3000/users/update', {
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

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      userObj.displayName = this.displayName;
      userObj.photoURL = photoURL;
      localStorage.setItem('user', JSON.stringify(userObj));
    }
    this.isLoading = false;
    window.location.reload();
  } catch (error) {
    console.error('Error updating user data:', error);
  } 
}

createFormData(file: File, email: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email); // Dodaj email u FormData
  return formData;
}

}



