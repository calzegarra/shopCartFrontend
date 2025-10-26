import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, FloatLabelModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = null;
    this.auth.login(this.username, this.password).subscribe({
      next: () => { this.loading = false; },
      error: () => { this.error = 'Credenciales invalidas'; this.loading = false; }
    });
  }
  
  ngOnInit(): void {
    this.auth.logout(false);
    this.username = '';
    this.password = '';
    this.loading = false;
    this.error = null;
  }
}
