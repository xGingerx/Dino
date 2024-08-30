import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firebaseConfig = {
    apiKey: "AIzaSyA4hgRz8WJtL3nmpjkNpYxjNAV-Zrs3wGU",
    authDomain: "restaurant-cded7.firebaseapp.com",
    projectId: "restaurant-cded7",
    storageBucket: "restaurant-cded7.appspot.com",
    messagingSenderId: "368353463913",
    appId: "1:368353463913:web:770e955b42ef01e61c9cf8"
  };

  private app = initializeApp(this.firebaseConfig);

  constructor() { }

  getAuth(): Auth {
    return getAuth(this.app);
  }

  getFirestore(): Firestore {
    return getFirestore(this.app);
  }
}
