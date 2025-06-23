// food-drink.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Food } from '../../models/food-drink.model'; 
import { Drink } from '../../models/food-drink.model';

@Injectable({
  providedIn: 'root'
})
export class FoodDrinkService {
  private apiUrl = 'http://localhost:8000/api/foods-and-drinks'; // Ajustez selon votre configuration

  constructor(private http: HttpClient) {}

  getFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.apiUrl}/foods/`);
  }

  getDrinks(): Observable<Drink[]> {
    return this.http.get<Drink[]>(`${this.apiUrl}/drinks/`);
  }
}