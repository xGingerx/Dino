import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    imports:[CommonModule, RouterModule]
})

export class NavbarComponent {
    constructor(private router: Router) {}
    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
