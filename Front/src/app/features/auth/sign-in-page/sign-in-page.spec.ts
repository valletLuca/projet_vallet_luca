import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { SignInPage } from './sign-in-page';

const LOGIN_URL = `${environment.apiUrl}/users/login`;
const STORAGE_KEY = 'sillage.user';
const CREDENTIALS = { email: 'alice@example.com', password: 'motdepasse1' };
const ALICE = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: CREDENTIALS.email,
  createdAt: '2026-11-06T10:00:00.000Z',
};

describe('SignInPage', () => {
  let fixture: ComponentFixture<SignInPage>;
  let http: HttpTestingController;
  let router: Router;
  let navigate: jasmine.Spy;

  const element = () => fixture.nativeElement as HTMLElement;
  const input = (id: string) => element().querySelector<HTMLInputElement>(`#${id}`)!;
  const alert = () => element().querySelector('[role="alert"]');

  function open(): void {
    fixture = TestBed.createComponent(SignInPage);
    fixture.detectChanges();
  }

  function submitCredentials(): void {
    for (const [id, value] of Object.entries(CREDENTIALS)) {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      imports: [SignInPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigate = spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('bloque le formulaire tant que les champs sont vides', () => {
    open();

    expect(element().querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBeTrue();
  });

  it('ouvre la session et redirige vers les signalements', () => {
    open();
    submitCredentials();

    const request = http.expectOne(LOGIN_URL);
    expect(request.request.body).toEqual(CREDENTIALS);
    request.flush(ALICE);

    expect(TestBed.inject(AuthService).currentUser()).toEqual(ALICE);
    expect(navigate).toHaveBeenCalledWith(['/pollutions']);
  });

  it("n'envoie pas deux fois le formulaire", () => {
    open();
    submitCredentials();
    element().querySelector('form')!.dispatchEvent(new Event('submit'));

    const requests = http.match(LOGIN_URL);
    expect(requests.length).toBe(1);
    requests[0].flush(ALICE);
  });

  it('indique des identifiants incorrects et rend la main', () => {
    open();
    submitCredentials();
    http.expectOne(LOGIN_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(alert()!.textContent).toContain('E-mail ou mot de passe incorrect.');
    expect(input('password').disabled).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('distingue une API injoignable', () => {
    open();
    submitCredentials();
    http.expectOne(LOGIN_URL).error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(alert()!.textContent).toContain('injoignable');
  });

  it("reprend l'e-mail du compte qui vient d'être créé", () => {
    spyOn(router, 'currentNavigation').and.returnValue({
      extras: { state: { registeredEmail: CREDENTIALS.email } },
    } as unknown as ReturnType<Router['currentNavigation']>);

    open();

    expect(input('email').value).toBe(CREDENTIALS.email);
  });
});
