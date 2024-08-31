import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { AboutComponent } from './about/about.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';

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
        path:"login",
        component: LoginComponent
    },
    { 
        path: '**', 
        redirectTo: "home" 
    }
];

