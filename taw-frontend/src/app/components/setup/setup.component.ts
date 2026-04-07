import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.css'
})
export class SetupComponent {
  data = { airlineName: '', iataCode: '', newPassword: '' };

  constructor(private api: ApiService, private router: Router) {}

  confirmSetup() {
    this.api.completeSetup(this.data).subscribe({
      next: () => {
        alert('Configurazione completata! Benvenuto a bordo.');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => alert('Errore: ' + (err.error?.message || err.message))
    });
  }
}