import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Crear cuenta</h2>
    <form (ngSubmit)="registrar()" #form="ngForm" style="max-width:420px;margin:1rem auto;display:flex;flex-direction:column;gap:.6rem;">
      <label>Usuario</label>
      <input type="text" name="username" [(ngModel)]="usuario.username" required>
      <label>Email</label>
      <input type="email" name="email" [(ngModel)]="usuario.email" required>
      <label>Contraseña</label>
      <input type="password" name="password" [(ngModel)]="usuario.password" required>
      <button type="submit" [disabled]="form.invalid" class="btn primary">Registrarse</button>
    </form>
  `
})
export class RegisterComponent {
  usuario = { username:'', email:'', password:'' };
  registrar(){ console.log('Usuario registrado:', this.usuario); }
}
