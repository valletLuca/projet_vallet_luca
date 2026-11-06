import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppHeader } from './app-header';

const STORAGE_KEY = 'sillage.user';
const ALICE = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent;

  function open(): void {
    TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
  }

  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('propose la connexion à un visiteur', () => {
    open();

    expect(text()).toContain('Connexion');
    expect(text()).not.toContain('Déconnexion');
  });

  it("affiche l'utilisateur connecté", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
    open();

    expect(text()).toContain('Alice');
    expect(text()).toContain('Déconnexion');
  });

  it('déconnecte et revient à la connexion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
    open();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    const logout = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button.header__link',
    )!;
    logout.click();
    fixture.detectChanges();

    expect(text()).toContain('Connexion');
    expect(text()).not.toContain('Déconnexion');
    expect(navigate).toHaveBeenCalledWith(['/connexion']);
  });
});
