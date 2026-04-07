import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
 
  stats: any = null;
  aircrafts: any[] = [];
  routes: any[] = [];

  users: any[] = []; 
  newAirlineEmail = '';
  tempPassword = '';

  myTickets: any[] = [];

  isAdmin = false;
  isAirline = false;     
  isPassenger = false;

  newAircraft = { model: '', rows: 20, seatsPerRow: 6, capacityBusiness: 0, capacityFirst: 0, capacityEconomy: 0 };
  newRoute = { departureCity: '', departureAirport: '', arrivalCity: '', arrivalAirport: '', durationMinutes: 60 };
  newFlight = { flightCode: '', aircraftId: '', routeId: '', date: '', departureTime: '', priceEconomy: 100, priceBusiness: 200, priceFirst: 500 };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.checkAccess();

    if (this.isPassenger) {
     
      this.loadMyTickets(); 
    } else {
      
      if (this.isAdmin) {
        this.loadUsers();
      }
    
      this.loadStats();
      this.loadAircrafts();
      this.loadRoutes();
    }
  }

  checkAccess() {
    const role = localStorage.getItem('role');

    this.isAdmin = (role === 'admin');
    this.isAirline = (role === 'airline');
    this.isPassenger = (role === 'passenger');

    if (!role) {
      alert('Accesso negato! Effettua il login.');
      this.router.navigate(['/login']);
    }
  }

  loadMyTickets() {
    this.api.getMyTickets().subscribe({
        next: (data: any) => this.myTickets = data,
        error: (err: any) => console.error('Errore biglietti:', err)
    });
  }

  //SEZIONE ADMIN 

  inviteAirline() {
    if (!this.newAirlineEmail) return;
    const generatedPass = Math.random().toString(36).slice(-8);

    this.api.createAirline({ email: this.newAirlineEmail, tempPassword: generatedPass }).subscribe({
      next: (res) => {
        this.tempPassword = generatedPass; 
        this.newAirlineEmail = '';
        this.loadUsers(); 
      },
      error: (err) => alert('Errore invito: ' + (err.error?.message || err.message))
    });
  }

  loadUsers() {
    this.api.getAllUsers().subscribe({
      next: (data: any) => this.users = data,
      error: (err: any) => console.error('Errore caricamento utenti:', err)
    });
  }

  deleteUser(user: any) {
    if (user.role === 'admin') {
      alert('Non puoi cancellare un admin!');
      return;
    }

    if (!confirm(`Sei sicuro di voler eliminare l'utente ${user.email}?`)) {
      return;
    }

    this.api.deleteUser(user._id).subscribe({
      next: () => {
        alert('Utente eliminato.');
        this.loadUsers(); 
        this.loadStats(); 
      },
      error: (err: any) => alert('Errore eliminazione: ' + (err.error?.message || err.message))
    });
  }

  //SEZIONE GESTIONE

  loadStats() {
    this.api.getAirlineStats().subscribe({
      next: (data: any) => this.stats = data,
      error: (err: any) => {
        console.log('Info Stats: ' + (err.error?.message || err.message));
        if (err.status === 401) {
            localStorage.clear();
            this.router.navigate(['/login']);
        }
      }
    });
  }

  loadAircrafts() {
    this.api.getAircrafts().subscribe({
      next: (data: any) => this.aircrafts = data,
      error: (err: any) => console.error('Errore aerei:', err)
    });
  }

  loadRoutes() {
    this.api.getRoutes().subscribe({
      next: (data: any) => this.routes = data,
      error: (err: any) => console.error('Errore rotte:', err)
    });
  }

  createAircraft() {
    const payload = {
      model: this.newAircraft.model,
      rows: this.newAircraft.rows,
      seatsPerRow: this.newAircraft.seatsPerRow,
      capacityBusiness: this.newAircraft.capacityBusiness,
      capacityFirst: this.newAircraft.capacityFirst,
      capacityEconomy: (this.newAircraft.rows * this.newAircraft.seatsPerRow) 
                       - this.newAircraft.capacityBusiness 
                       - this.newAircraft.capacityFirst
    };

    this.api.createAircraft(payload).subscribe({
      next: () => {
        alert('Aereo aggiunto!');
        this.loadAircrafts(); 
        this.newAircraft = { model: '', rows: 20, seatsPerRow: 6, capacityBusiness: 0, capacityFirst: 0, capacityEconomy: 0 };
      },
      error: (err: any) => alert('Errore aereo: ' + (err.error?.message || err.message))
    });
  }

  createRoute() {
    this.api.createRoute(this.newRoute).subscribe({
      next: () => {
        alert('Rotta creata!');
        this.loadRoutes(); 
        this.newRoute = { departureCity: '', departureAirport: '', arrivalCity: '', arrivalAirport: '', durationMinutes: 60 };
      },
      error: (err: any) => alert('Errore rotta: ' + (err.error?.message || err.message))
    });
  }

  createFlight() {
    const payload = {
        flightCode: this.newFlight.flightCode,
        aircraftId: this.newFlight.aircraftId,
        routeId: this.newFlight.routeId,
        departureTime: `${this.newFlight.date}T${this.newFlight.departureTime}:00.000Z`, 
        priceEconomy: this.newFlight.priceEconomy,
        priceBusiness: this.newFlight.priceBusiness,
        priceFirst: this.newFlight.priceFirst
    };

    this.api.createFlight(payload).subscribe({
      next: () => {
        alert('Volo schedulato!');
        this.loadStats();
        this.newFlight.flightCode = '';
      },
      error: (err: any) => alert('Errore volo: ' + (err.error?.message || err.message))
    });
  }
}