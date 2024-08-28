import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-signin',
    standalone: true,
    imports:[RouterModule, RouterOutlet],
    templateUrl: './signin.component.html',
    styleUrl: './signin.component.css'
})

export class SigninComponent {
    title= 'Sign-in';
};