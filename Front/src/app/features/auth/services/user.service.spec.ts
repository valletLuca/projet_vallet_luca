import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { SignUpRequest, User } from '../models/user.model';
import { UserService } from './user.service';

const USERS_URL = `${environment.apiUrl}/users`;
const ALICE: User = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('liste les utilisateurs', () => {
    let users: User[] | undefined;
    service.getAll().subscribe((result) => (users = result));

    const request = http.expectOne(USERS_URL);
    expect(request.request.method).toBe('GET');
    request.flush([ALICE]);

    expect(users).toEqual([ALICE]);
  });

  it('crée un utilisateur', () => {
    const signUp: SignUpRequest = {
      firstName: 'Alice',
      lastName: 'Dupont',
      email: 'alice@example.com',
      password: 'motdepasse1',
    };
    let created: User | undefined;
    service.create(signUp).subscribe((result) => (created = result));

    const request = http.expectOne(USERS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(signUp);
    request.flush(ALICE);

    expect(created).toEqual(ALICE);
  });

  it('supprime un utilisateur', () => {
    service.delete(ALICE.id).subscribe();

    const request = http.expectOne(`${USERS_URL}/${ALICE.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
