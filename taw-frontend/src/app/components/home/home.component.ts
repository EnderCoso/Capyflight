import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  flights: any[] = [];
  
  fromCity: string = '';
  toCity: string = '';
  selectedDate: string = '';
  hasSearched = false;

  showModal = false;
  selectedFlight: any = null;
  availableSeats: any[] = [];
  bookingSeat: string = '';
  addBag = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadDefaultFlights();
  }

  loadDefaultFlights() {
    this.api.searchFlights({}).subscribe({
      next: (data: any) => {
        this.flights = data;
        this.hasSearched = false;
        console.log('✈️ Voli Vetrina caricati:', this.flights);
      },
      error: (err: any) => console.error('Errore caricamento default:', err)
    });
  }

  loadFlights() {
    if (!this.fromCity || !this.toCity || !this.selectedDate) {
      alert('Per cercare, inserisci città di partenza, destinazione e data!');
      return;
    }

    this.hasSearched = true;

    const searchParams = {
      from: this.fromCity,
      to: this.toCity,
      date: this.selectedDate
    };

    this.api.searchFlights(searchParams).subscribe({
      next: (data: any) => {
        this.flights = data;
      },
      error: (err: any) => console.error('Errore ricerca:', err)
    });
  }

  getArrivalTime(flight: any): Date {
    if (flight.arrivalTime) return new Date(flight.arrivalTime);
    const dep = new Date(flight.departureTime);
    return new Date(dep.getTime() + (flight.route.durationMinutes * 60000));
  }

  //GESTIONE PRENOTAZIONE

currentLegIndex: number = 0; 
selectedSeats: string[] = []; 

openBookingModal(flight: any) {
  if (!localStorage.getItem('token')) {
    alert('Devi fare il login per prenotare! 🔒');
    this.router.navigate(['/login']);
    return;
  }

  this.selectedFlight = flight;
  this.currentLegIndex = 0; 
  this.selectedSeats = [];
  this.addBag = false;
  this.showModal = true;
  
  this.updateAvailableSeats();
}

updateAvailableSeats() {
  let seatsSource = [];
  if (this.selectedFlight.type === 'direct') {
    seatsSource = this.selectedFlight.seats || [];
  } else {
    seatsSource = this.selectedFlight.legs[this.currentLegIndex].seats || [];
  }
  this.availableSeats = seatsSource.filter((s: any) => !s.isOccupied);
  this.bookingSeat = ''; 
}

  closeModal() {
    this.showModal = false;
    this.selectedFlight = null;
  }

confirmBooking() {
  if (!this.bookingSeat) {
    alert('Seleziona un posto!');
    return;
  }

  if (this.selectedFlight.type === 'direct') {
    this.executeBooking(this.selectedFlight._id, this.bookingSeat, true);
  } 

  else {
    this.selectedSeats.push(this.bookingSeat);

    if (this.currentLegIndex === 0) {
      this.currentLegIndex = 1;
      alert('Posto per la prima tratta selezionato! Ora scegli il posto per il secondo volo.');
      this.updateAvailableSeats();
    } else {
      this.executeStopoverBookings();
    }
  }
}
  
executeStopoverBookings() {
  const data1 = {
    flightId: this.selectedFlight.legs[0]._id,
    seatNumber: this.selectedSeats[0],
    extras: { extraBaggage: this.addBag }
  };

  this.api.bookFlight(data1).subscribe({
    next: () => {
      const data2 = {
        flightId: this.selectedFlight.legs[1]._id,
        seatNumber: this.selectedSeats[1],
        extras: { extraBaggage: this.addBag }
      };
      
      this.api.bookFlight(data2).subscribe({
        next: () => {
          alert('Entrambi i voli prenotati con successo!');
          this.finalizeBooking();
        },
        error: (err) => alert('Errore secondo volo: ' + err.error?.message)
      });
    },
    error: (err) => alert('Errore primo volo: ' + err.error?.message)
  });
}

executeBooking(fId: string, seat: string, finalize: boolean) {
  this.api.bookFlight({ flightId: fId, seatNumber: seat, extras: { extraBaggage: this.addBag } }).subscribe({
    next: () => {
      if(finalize) {
        alert('Prenotazione Confermata!');
        this.finalizeBooking();
      }
    },
    error: (err) => alert('Errore: ' + err.error?.message)
  });
}

  finalizeBooking() {
    this.closeModal();
    this.hasSearched ? this.loadFlights() : this.loadDefaultFlights();
  }
}