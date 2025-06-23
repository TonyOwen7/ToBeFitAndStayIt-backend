import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Food } from '../../models/food-drink.model'; 
import { Drink } from '../../models/food-drink.model';

@Injectable({
  providedIn: 'root'
})
export class CustomItemsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🍽️ Foods
  createCustomFood(food: Food): Observable<Food> {
    return this.http.post<Food>(`${this.baseUrl}/foods/create/`, food);
  }

  getAvailableFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/foods/`);
  }

  updateFood(id: number, food: Partial<Food>): Observable<Food> {
    return this.http.patch<Food>(`${this.baseUrl}/foods/${id}/`, food);
  }

  deleteFood(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/foods/${id}/delete/`);
  }

  // 🥤 Drinks
  createCustomDrink(drink: Drink): Observable<Drink> {
    return this.http.post<Drink>(`${this.baseUrl}/drinks/create/`, drink);
  }

  getAvailableDrinks(): Observable<Drink[]> {
    return this.http.get<Drink[]>(`${this.baseUrl}/drinks/`);
  }

  updateDrink(id: number, drink: Partial<Drink>): Observable<Drink> {
    return this.http.patch<Drink>(`${this.baseUrl}/drinks/${id}/`, drink);
  }

  deleteDrink(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/drinks/${id}/delete/`);
  }
}
