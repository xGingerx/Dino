import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-about',
    standalone: true,
    imports:[RouterModule, RouterOutlet, NavbarComponent],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css'
})

export class AboutComponent {
    title= 'About';
};