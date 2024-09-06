import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './auth/firebase.service'; // Adjust the path if needed
import { Auth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { response } from 'express';

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
      if (user) {
        await this.fetchUserData(user.email!);
      } else {
        this.displayName = '';
      }
    });
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
      }
      })
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async login() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.firebaseService.getAuth(), provider);
    const user = {
      email: result.user.email,
      displayName: result.user.displayName || "",
      uid: result.user.uid,
      photoURL: result.user.photoURL
    }

    await fetch('http://localhost:3000/users/create',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('User created successfully:', data);
      localStorage.setItem('user', JSON.stringify(data));
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
    
  }

  logout() {
    this.firebaseService.getAuth().signOut()
      .then(() => {
        localStorage.clear()
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
      });
  }

  isUserLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
