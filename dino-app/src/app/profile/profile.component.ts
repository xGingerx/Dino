import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [RouterModule, RouterOutlet],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})

export class ProfileComponent {
    title= 'Profile';
};