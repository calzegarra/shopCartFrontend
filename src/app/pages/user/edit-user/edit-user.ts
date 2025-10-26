import { Component, OnInit } from '@angular/core';
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
import { AuthService, UserProfile } from '../../../services/auth.service';
import { ResponseData } from '../../../model/responseData.model';
import { User } from '../../../model/user.model';
import { AuthRequest } from '../../../model/auth.model';

type AvatarPayload = { preview: string; raw: string };

@Component({
  selector: 'app-edit-user',
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
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.scss']
})
export class EditUserComponent implements OnInit {
  readonly namePattern = /^[A-Za-z\u00C0-\u00FF\s]*$/;

  user: User = this.createEmptyUser();
  confirmPassword = '';
  avatarPreview: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const current = this.auth.user();
    if (!current) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.confirmPassword = current.password;
    this.loadUser(current);
  }

  get passwordsMatch(): boolean {
    return !!this.user.password && this.user.password === this.confirmPassword;
  }

  get formReady(): boolean {
    const requiredFilled = !!(
      this.user.id !== undefined &&
      this.user.id !== null &&
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

  goBack() {
    this.router.navigateByUrl('/future-videogames');
  }

  submit(form: NgForm) {
    if (!this.formReady || form.invalid) {
      form.control.markAllAsTouched();
      this.error = 'Revisa los campos obligatorios antes de continuar.';
      return;
    }
    this.error = null;
    this.success = null;
    this.saving = true;

    const payload: User = {
      ...this.user,
      avatar: this.user.avatar ?? null
    };

    this.http.post<ResponseData<User>>('http://localhost:8080/api/user/update', payload).subscribe({
      next: (res) => {
        this.saving = false;
        const updated = res?.data ?? payload;
        this.success = 'Perfil actualizado correctamente.';
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil actualizado',
          detail: `Los datos de ${updated.username} se guardaron correctamente.`
        });
        this.applyUser(updated);
        this.updateSessionCache(updated);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message ?? 'No se pudo actualizar el usuario. Intentalo nuevamente.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error ?? 'No se pudo actualizar el usuario.' });
      }
    });
  }

  private loadUser(current: UserProfile) {
    this.loading = true;
    const payload: AuthRequest = {
      username: current.username,
      password: current.password
    };

    this.http.post<ResponseData<User>>('http://localhost:8080/api/auth/profile', payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res?.data) {
          this.error = 'No se pudo obtener la informacion del usuario.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error ?? 'No se pudo obtener la informacion del usuario.' });
          return;
        }
        this.applyUser(res.data);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo obtener la informacion del usuario.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error ?? 'No se pudo obtener la informacion del usuario.' });
      }
    });
  }

  private applyUser(data: User) {
    const preview = data.avatar
      ? (data.avatar.startsWith('data:') ? data.avatar : `data:image/png;base64,${data.avatar}`)
      : null;
    const raw = preview ? preview.split(',')[1] : data.avatar ?? null;

    this.user = {
      ...data,
      id: data.id ?? this.user.id,
      role: data.role ?? this.user.role,
      avatar: raw ?? null
    };
    this.avatarPreview = preview;
    this.confirmPassword = data.password;
    this.error = null;
  }

  private updateSessionCache(data: User) {
    if (!data.id) return;
    const preview = data.avatar
      ? (data.avatar.startsWith('data:') ? data.avatar : `data:image/png;base64,${data.avatar}`)
      : null;

    const profile: UserProfile = {
      id: data.id,
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role,
      avatar: preview
    };
    this.auth.updateSession(profile);
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

  private createEmptyUser(): User {
    return {
      id: 0,
      name: '',
      lastname: '',
      dni: '',
      address: '',
      email: '',
      username: '',
      password: '',
      role: { id: 3, description: 'Cliente' },
      avatar: null
    };
  }
}

