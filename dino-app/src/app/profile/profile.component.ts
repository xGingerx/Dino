import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { FirebaseService } from '../navbar/auth/firebase.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  reservations: { date: string, time: string }[] = [];
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
        if(storedUser) {
          const userObj = JSON.parse(storedUser);
          this.displayName = userObj.displayName;
          this.email = userObj.email;
          this.photoURL = userObj.photoURL;
          Object.entries(userObj.reservations).forEach(([key, value]) => {
            this.reservations.push({
              date: key,
              time: (value as string)
            })
          })          
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

        if(data) {
          localStorage.setItem('user', JSON.stringify(data))
        }

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
  formData.append('email', email);
  return formData;
}

}



