import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SignUpError, SignUpRequest, User } from '../models/user.model';

/** Réponse brute de l'API : elle renvoie aussi le mot de passe, qu'on ne garde pas. */
type UserResponse = User & { password?: string };

/** Encapsule les appels HTTP liés aux comptes utilisateurs. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** URL construite depuis l'environnement : localhost en dev, API publique en prod. */
  private readonly usersUrl = `${environment.apiUrl}/users`;

  /**
   * Inscrit un utilisateur :
   * 1. GET  /users?email=… pour refuser un e-mail déjà utilisé ;
   * 2. POST /users pour créer le compte.
   */
  signUp(request: SignUpRequest): Observable<User> {
    return this.http.get<UserResponse[]>(this.usersUrl, { params: { email: request.email } }).pipe(
      switchMap((existing) =>
        existing.length > 0
          ? throwError(() => new SignUpError('email-taken'))
          : this.http.post<UserResponse>(this.usersUrl, {
              ...request,
              createdAt: new Date().toISOString(),
            }),
      ),
      map(({ id, firstName, lastName, email, createdAt }) => ({
        id,
        firstName,
        lastName,
        email,
        createdAt,
      })),
      catchError((error: unknown) => throwError(() => toSignUpError(error))),
    );
  }
}

function toSignUpError(error: unknown): SignUpError {
  if (error instanceof SignUpError) {
    return error;
  }
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return new SignUpError('network');
  }
  return new SignUpError('server');
}
