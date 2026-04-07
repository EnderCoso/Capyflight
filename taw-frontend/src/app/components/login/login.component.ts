import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  
  email = '';
  password = '';
  errorMessage = ''; 

  constructor(private api: ApiService, private router: Router) {}

  
  onLogin() {
    this.errorMessage = '';

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.api.login(credentials).subscribe({
      next: (res: any) => {
        
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);

        if (res.mustChangePassword) {
          alert('⚠️ Primo accesso rilevato. Devi configurare il tuo account.');
          this.router.navigate(['/setup']);
        } 
        else if (res.role === 'airline' || res.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        console.error('Errore Login:', err);
        this.errorMessage = err.error?.message || 'Login fallito. Controlla le credenziali.';
      }
    });
  }
}