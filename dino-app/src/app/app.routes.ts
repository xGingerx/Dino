import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { AboutComponent } from './about/about.component';
import { ProfileComponent } from './profile/profile.component';
import { SigninComponent } from './sign-in/signin.component';
import { SignupComponent } from './sign-up/signup.component';

export const routes: Routes = [
    { 
        path: "", pathMatch: "full", 
        redirectTo: "home" 
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "about",
        component: AboutComponent
    },
    {
        path: "profile",
        component: ProfileComponent
    },
    {
        path: "sign-in",
        component: SigninComponent
    },
    {
        path: "sign-up",
        component: SignupComponent
    },
    { 
        path: '**', 
        redirectTo: "home" 
    }
];

