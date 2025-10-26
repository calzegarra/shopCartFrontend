import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CreateUserRequest } from '../../../model/user.model';

type AvatarPayload = { preview: string; raw: string };

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FloatLabelModule,
  
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FileUploadModule,
    KeyFilterModule,
    ImageModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './new-user.html',
  styleUrls: ['./new-user.scss']
})
export class NewUserComponent {
  readonly role = { id: 3, description: 'Cliente' };
  readonly namePattern = /^[A-Za-z\u00C0-\u00FF\s]*$/;
  user: CreateUserRequest = this.createInitialUser();
  confirmPassword = '';
  avatarPreview: string | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {}

  get passwordsMatch(): boolean {
    return !!this.user.password && this.user.password === this.confirmPassword;
  }

  get formReady(): boolean {
    const requiredFilled = !!(
      this.user.name &&
      this.user.lastname &&
      this.user.dni &&
      this.user.address &&
      this.user.email &&
      this.user.username &&
      this.user.password &&
      this.confirmPassword
    );
    return requiredFilled && this.passwordsMatch;
  }

  async handleAvatarUpload(event: FileUploadHandlerEvent) {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    try {
      const { preview, raw } = await this.readFileAsBase64(file);
      this.avatarPreview = preview;
      this.user.avatar = raw;
      this.error = null;
    } catch {
      this.error = 'No se pudo procesar la imagen seleccionada.';
    } finally {
      const clearFn = (event as any)?.options?.clear;
      if (typeof clearFn === 'function') clearFn();
    }
  }

  onAvatarRemove() {
    this.avatarPreview = null;
    this.user.avatar = null;
  }

  submit(form: NgForm) {
    if (!this.formReady || form.invalid) {
      form.control.markAllAsTouched();
      this.error = 'Revisa los campos obligatorios antes de continuar.';
      return;
    }
    this.error = null;
    this.success = null;
    this.loading = true;

    const payload: CreateUserRequest = {
      ...this.user,
      role: this.role,
      avatar: this.user.avatar ?? null
    };

    this.http.post('http://localhost:8080/api/user/create', payload).subscribe({
      next: () => {
        this.loading = false;
        const createdUser = payload.username;
        this.success = 'Usuario creado con exito.';
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario creado',
          detail: `El usuario ${createdUser} ha sido creado correctamente.`
        });
        form.resetForm();
        this.user = this.createInitialUser();
        this.confirmPassword = '';
        this.onAvatarRemove();
        setTimeout(() => this.router.navigateByUrl('/future-videogames'), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'No se pudo crear el usuario. Intentalo nuevamente.';
      }
    });
  }

  private readFileAsBase64(file: File): Promise<AvatarPayload> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(',');
        if (commaIndex === -1) {
          reject(new Error('Formato de imagen invalido'));
          return;
        }
        resolve({ preview: result, raw: result.substring(commaIndex + 1) });
      };
      reader.readAsDataURL(file);
    });
  }

  goBack() {
    this.router.navigateByUrl('/login');
  }


  private createInitialUser(): CreateUserRequest {
    return {
      name: '',
      lastname: '',
      dni: '',
      address: '',
      email: '',
      username: '',
      password: '',
      role: this.role,
      avatar: null
    };
  }
}
