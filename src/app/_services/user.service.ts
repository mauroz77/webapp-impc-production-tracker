import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

import { User } from '../_models';
import { environment } from 'src/environments/environment';
import { empty, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  createUser(user: User) {
    console.log('user: ', user);
    return this.http.post<User[]>(`${environment.baseUrl}/auth/signup`, user)
        .pipe(map(result => {
            // Create user successful if there's a user in the response
            if (result) {
              console.log('result: ', result);
            }
            return result;
        }));
  }
}