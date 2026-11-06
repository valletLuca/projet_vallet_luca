import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SignInError,
  SignInRequest,
  SignUpError,
  SignUpRequest,
  User,
} from '../models/user.model';
import { UserService } from './user.service';

const SESSION_STORAGE_KEY = 'sillage.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly session = signal<User | null>(readStoredUser());

  readonly currentUser = this.session.asReadonly();

  signUp(request: SignUpRequest): Observable<User> {
    return this.userService
      .create(request)
      .pipe(catchError((error: unknown) => throwError(() => toSignUpError(error))));
  }

  signIn(request: SignInRequest): Observable<User> {
    return this.http.post<User>(`${this.usersUrl}/login`, request).pipe(
      tap((user) => {
        this.session.set(user);
        writeStoredUser(user);
      }),
      catchError((error: unknown) => throwError(() => toSignInError(error))),
    );
  }

  logout(): void {
    this.session.set(null);
    writeStoredUser(null);
  }
}

function toSignUpError(error: unknown): SignUpError {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 0:
        return new SignUpError('network');
      case 400:
        return new SignUpError('invalid-data');
      case 409:
        return new SignUpError('email-taken');
    }
  }
  return new SignUpError('server');
}

function toSignInError(error: unknown): SignInError {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 0:
        return new SignInError('network');
      case 401:
        return new SignInError('invalid-credentials');
    }
  }
  return new SignInError('server');
}

function readStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null') as User | null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    return;
  }
}
