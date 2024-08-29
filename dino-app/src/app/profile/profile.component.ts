import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [RouterModule, RouterOutlet, NavbarComponent],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})

export class ProfileComponent {
    title= 'Profile';
};