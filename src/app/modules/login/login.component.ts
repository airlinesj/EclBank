import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('nbs_auth_token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // Simulate authentication delay
    setTimeout(() => {
      const { email, password } = this.loginForm.value;

      // Simple demo authentication - in production, call a real API
      if (email && password.length >= 6) {
        // Store auth token (in real app, this comes from server)
        localStorage.setItem('nbs_auth_token', `token_${Date.now()}`);
        localStorage.setItem('nbs_user_email', email);
        
        this.loading = false;
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Invalid credentials';
        this.loading = false;
      }
    }, 800);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
