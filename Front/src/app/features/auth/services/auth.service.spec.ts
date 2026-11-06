import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { SignInError, SignUpError, SignUpErrorReason, SignUpRequest, User } from '../models/user.model';
import { AuthService } from './auth.service';

const USERS_URL = `${environment.apiUrl}/users`;
const LOGIN_URL = `${USERS_URL}/login`;
const STORAGE_KEY = 'sillage.user';
const ALICE: User = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};
const SIGN_UP: SignUpRequest = {
  firstName: 'Alice',
  lastName: 'Dupont',
  email: ALICE.email,
  password: 'motdepasse1',
};
const CREDENTIALS = { email: ALICE.email, password: SIGN_UP.password };

describe('AuthService', () => {
  let http: HttpTestingController;

  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => {
    http.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('signUp', () => {
    it("crée le compte en un seul appel : c'est l'API qui contrôle les doublons", () => {
      let created: User | undefined;
      createService().signUp(SIGN_UP).subscribe((user) => (created = user));

      const request = http.expectOne(USERS_URL);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(SIGN_UP);
      request.flush(ALICE);

      expect(created).toEqual(ALICE);
    });

    it("n'ouvre pas de session", () => {
      const service = createService();
      service.signUp(SIGN_UP).subscribe();

      http.expectOne(USERS_URL).flush(ALICE);

      expect(service.currentUser()).toBeNull();
    });

    const failures: [number, SignUpErrorReason][] = [
      [409, 'email-taken'],
      [400, 'invalid-data'],
      [500, 'server'],
    ];
    for (const [status, reason] of failures) {
      it(`traduit un statut ${status} en erreur « ${reason} »`, () => {
        let error: unknown;
        createService().signUp(SIGN_UP).subscribe({ error: (e) => (error = e) });

        http.expectOne(USERS_URL).flush(null, { status, statusText: 'Erreur' });

        expect(error).toBeInstanceOf(SignUpError);
        expect((error as SignUpError).reason).toBe(reason);
      });
    }

    it('traduit une API injoignable en erreur « network »', () => {
      let error: SignUpError | undefined;
      createService().signUp(SIGN_UP).subscribe({ error: (e) => (error = e) });

      http.expectOne(USERS_URL).error(new ProgressEvent('error'));

      expect(error?.reason).toBe('network');
    });
  });

  describe('signIn', () => {
    it('ouvre la session et la conserve', () => {
      const service = createService();
      service.signIn(CREDENTIALS).subscribe();

      const request = http.expectOne(LOGIN_URL);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(CREDENTIALS);
      expect(service.currentUser()).toBeNull();
      request.flush(ALICE);

      expect(service.currentUser()).toEqual(ALICE);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(ALICE);
    });

    it('refuse des identifiants incorrects sans ouvrir de session', () => {
      const service = createService();
      let error: SignInError | undefined;
      service.signIn(CREDENTIALS).subscribe({ error: (e) => (error = e) });

      http.expectOne(LOGIN_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(error?.reason).toBe('invalid-credentials');
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('session', () => {
    it('restaure la session enregistrée', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));

      expect(createService().currentUser()).toEqual(ALICE);
    });

    it('ignore une session enregistrée illisible', () => {
      localStorage.setItem(STORAGE_KEY, '{oups');

      expect(createService().currentUser()).toBeNull();
    });

    it('ferme la session à la déconnexion', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
      const service = createService();

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
