import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [RouterModule, RouterOutlet],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css'
})

export class SigninComponent {
    title= 'Sign-up';
};