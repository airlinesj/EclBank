import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Banking', path: '/banking' },
    { label: 'ECL', path: '/ecl' },
    { label: 'Reports', path: '/reports' },
    { label: 'Audit', path: '/audit' }
  ];

  ngOnDestroy(): void {
    // Clean up sidebar state
    this.sidebarOpen = false;
  }
}
