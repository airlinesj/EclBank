import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  title = 'Banking ECL';
  sidebarOpen = false;
  
  constructor(public router: Router) {}

  get isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }
  
  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  onSidebarClick(event: Event): void {
    event.stopPropagation();
  }

  navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Banking', path: '/banking', icon: 'account_balance' },
    { label: 'ECL', path: '/ecl', icon: 'calculate' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
    { label: 'Audit', path: '/audit', icon: 'history' }
  ];

  ngOnDestroy(): void {
    // Clean up sidebar state
    this.sidebarOpen = false;
  }
}
