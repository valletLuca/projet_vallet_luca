import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

const STORAGE_KEY = 'sillage.user';
const ALICE = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};

describe('routes', () => {
  async function landOn(url: string): Promise<string> {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    await RouterTestingHarness.create(url);
    return TestBed.inject(Router).url;
  }

  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('amène un visiteur sur la connexion au lancement', async () => {
    expect(await landOn('/')).toBe('/connexion');
  });

  it('amène un utilisateur déjà connecté sur les signalements au lancement', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));

    expect(await landOn('/')).toBe('/pollutions');
  });

  it('amène un visiteur sur la connexion depuis une adresse inconnue', async () => {
    expect(await landOn('/page-inconnue')).toBe('/connexion');
  });

  it('amène un utilisateur connecté sur les signalements depuis une adresse inconnue', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));

    expect(await landOn('/page-inconnue')).toBe('/pollutions');
  });
});
