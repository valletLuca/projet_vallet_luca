import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SignUpPage } from './sign-up-page';

const USERS_URL = `${environment.apiUrl}/users`;
const VALID = {
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  password: 'motdepasse1',
  confirmPassword: 'motdepasse1',
};
const CREATED = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};

describe('SignUpPage', () => {
  let fixture: ComponentFixture<SignUpPage>;
  let http: HttpTestingController;

  const element = () => fixture.nativeElement as HTMLElement;
  const input = (id: string) => element().querySelector<HTMLInputElement>(`#${id}`)!;
  const submitButton = () => element().querySelector<HTMLButtonElement>('button[type="submit"]')!;

  function fill(values: Record<string, string>): void {
    for (const [id, value] of Object.entries(values)) {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
      input(id).dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();
  }

  function submit(): void {
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function failWith(status: number): void {
    fill(VALID);
    submit();
    http.expectOne(USERS_URL).flush(null, { status, statusText: 'Erreur' });
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignUpPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SignUpPage);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('bloque un formulaire vide', () => {
    expect(submitButton().disabled).toBeTrue();
    submit();
    http.expectNone(USERS_URL);
  });

  it('coche les règles du mot de passe au fil de la saisie', () => {
    const satisfied = () => element().querySelectorAll('.rules__item--ok').length;
    expect(satisfied()).toBe(0);

    fill({ password: 'abc' });
    expect(satisfied()).toBe(1);

    fill({ password: 'abcdefg1' });
    expect(satisfied()).toBe(3);
  });

  it('refuse un mot de passe sans chiffre', () => {
    fill({ ...VALID, password: 'motdepasse', confirmPassword: 'motdepasse' });

    expect(element().textContent).toContain('au moins une lettre et un chiffre');
    expect(submitButton().disabled).toBeTrue();
  });

  it('refuse une confirmation différente', () => {
    fill({ ...VALID, confirmPassword: 'autrechose1' });

    expect(element().textContent).toContain('Les mots de passe ne correspondent pas.');
    expect(submitButton().disabled).toBeTrue();
  });

  it('revalide la confirmation quand le mot de passe change', () => {
    fill(VALID);
    expect(submitButton().disabled).toBeFalse();

    fill({ password: 'nouveaumdp1' });

    expect(submitButton().disabled).toBeTrue();
  });

  it('refuse un e-mail sans domaine complet, comme le fait l’API', () => {
    fill({ ...VALID, email: 'alice@example' });

    expect(element().textContent).toContain("Cette adresse e-mail n'est pas valide.");
    expect(submitButton().disabled).toBeTrue();
  });

  it('refuse un prénom composé uniquement d’espaces', () => {
    fill({ ...VALID, firstName: '   ' });

    expect(submitButton().disabled).toBeTrue();
  });

  it('affiche ou masque le mot de passe', () => {
    const toggle = element().querySelector<HTMLButtonElement>('.password-toggle')!;
    expect(input('password').type).toBe('password');

    toggle.click();
    fixture.detectChanges();

    expect(input('password').type).toBe('text');
    expect(input('confirmPassword').type).toBe('text');
  });

  it("envoie à l'API uniquement les champs attendus, nettoyés", () => {
    fill({ ...VALID, firstName: '  Alice ', email: ' Alice@Example.com ' });
    fill({ email: 'Alice@Example.com' });
    submit();

    const request = http.expectOne(USERS_URL);
    expect(request.request.body).toEqual({
      firstName: 'Alice',
      lastName: 'Dupont',
      email: 'alice@example.com',
      password: 'motdepasse1',
    });
    request.flush(CREATED);
  });

  it('souhaite la bienvenue et propose de se connecter', () => {
    fill(VALID);
    submit();
    http.expectOne(USERS_URL).flush(CREATED);
    fixture.detectChanges();

    expect(element().textContent).toContain('Bienvenue, Alice !');
    expect(element().querySelector('form')).toBeNull();
    expect(element().querySelector('a[href="/connexion"]')).not.toBeNull();
  });

  it("n'envoie pas deux fois le formulaire", () => {
    fill(VALID);
    submit();
    submit();

    const requests = http.match(USERS_URL);
    expect(requests.length).toBe(1);
    requests[0].flush(CREATED);
  });

  it('verrouille le formulaire pendant l’envoi', () => {
    fill(VALID);
    submit();

    expect(input('email').disabled).toBeTrue();
    expect(submitButton().textContent).toContain('Création du compte…');
    http.expectOne(USERS_URL).flush(CREATED);
  });

  it("signale sur le champ un e-mail déjà utilisé et rend la main", () => {
    failWith(409);

    expect(element().querySelector('#email-error')!.textContent).toContain(
      'Un compte existe déjà avec cette adresse e-mail.',
    );
    expect(input('email').disabled).toBeFalse();
    expect(element().querySelector('[role="alert"]')).toBeNull();
  });

  it("efface l'erreur d'e-mail dès que l'adresse est corrigée", () => {
    failWith(409);

    fill({ email: 'bob@example.com' });

    expect(element().querySelector('#email-error')!.textContent).not.toContain('Un compte existe');
    expect(submitButton().disabled).toBeFalse();
  });

  const banners: [string, () => void, string][] = [
    ['une API injoignable', () => http.expectOne(USERS_URL).error(new ProgressEvent('error')), 'injoignable'],
    ['une erreur serveur', () => http.expectOne(USERS_URL).flush(null, { status: 500, statusText: 'x' }), 'a rencontré une erreur'],
    ['des données refusées', () => http.expectOne(USERS_URL).flush(null, { status: 400, statusText: 'x' }), 'refusées'],
  ];
  for (const [label, respond, message] of banners) {
    it(`affiche un bandeau pour ${label}`, () => {
      fill(VALID);
      submit();
      respond();
      fixture.detectChanges();

      expect(element().querySelector('[role="alert"]')!.textContent).toContain(message);
    });
  }
});
