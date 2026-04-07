import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = { name: '', surname: '', birthDate: '', email: '', password: '' };

  constructor(private api: ApiService, private router: Router) {}

  register() {
    this.api.register(this.user).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        alert('Registrazione completata! Benvenuto a bordo.');
        this.router.navigate(['/home']);
      },
      error: (err: any) => alert('Errore: ' + (err.error?.message || err.message))
    });
  }
}