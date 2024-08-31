import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FirebaseService } from './auth/firebase.service';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';


@Component({
    selector: 'app-login',
    standalone: true,
    imports:[CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent{
    title='login'
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
};