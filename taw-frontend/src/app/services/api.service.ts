import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // --- HELPER TOKEN ---
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // --- AUTH ---
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/users`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/sessions`, credentials);
  }

  // Admin: Crea Compagnia
  createAirline(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/airlines`, data, this.getHeaders());
  }

  // Airline: Primo setup password
  completeSetup(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/airlines`, data, this.getHeaders());
  }

  // Admin: Gestione Utenti
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/users`, this.getHeaders());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/auth/users/${id}`, this.getHeaders());
  }

  //STATS
  getAirlineStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights/statistics`, this.getHeaders());
  }

  //AEREI
  getAircrafts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/airlines/aircrafts`, this.getHeaders());
  }

  createAircraft(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/airlines/aircrafts`, data, this.getHeaders());
  }

  //ROTTE
  getRoutes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/airlines/routes`, this.getHeaders());
  }

  createRoute(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/airlines/routes`, data, this.getHeaders());
  }

  // VOLI
  // Pubblico
  searchFlights(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights`, { params });
  }

  // Protetto
  createFlight(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flights`, data, this.getHeaders());
  }

  //PRENOTAZIONI
  bookFlight(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookings`, data, this.getHeaders());
  }

  getMyTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/my-tickets`, this.getHeaders());
  }
}