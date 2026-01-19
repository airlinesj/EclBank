import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Banking ECL';
  sidebarOpen = false;
  
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  navigation = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Banking', path: '/banking' },
    { label: 'ECL', path: '/ecl' },
    { label: 'Reports', path: '/reports' },
    { label: 'Audit', path: '/audit' }
  ];
}
