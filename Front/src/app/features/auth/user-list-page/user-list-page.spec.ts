import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { UserListPage } from './user-list-page';

const USERS_URL = `${environment.apiUrl}/users`;
const STORAGE_KEY = 'sillage.user';
const ALICE: User = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  createdAt: '2026-11-06T10:00:00.000Z',
};
const BOB: User = { ...ALICE, id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob@example.com' };

describe('UserListPage', () => {
  let fixture: ComponentFixture<UserListPage>;
  let http: HttpTestingController;

  const element = () => fixture.nativeElement as HTMLElement;
  const rows = () => element().querySelectorAll('.users__item');
  const button = (label: string, root: ParentNode = element()) =>
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes(label))!;

  function open(): void {
    fixture = TestBed.createComponent(UserListPage);
    fixture.detectChanges();
  }

  function flushUsers(users: User[]): void {
    http.expectOne(USERS_URL).flush(users);
    fixture.detectChanges();
  }

  function confirmDeletion(row: Element): void {
    button('Supprimer', row).click();
    fixture.detectChanges();
    button('Supprimer', element().querySelector('dialog')!).click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      imports: [UserListPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  it("affiche l'état de chargement puis les utilisateurs renvoyés par l'API", () => {
    open();
    expect(element().querySelector('[role="status"]')).not.toBeNull();

    flushUsers([ALICE, BOB]);

    expect(rows().length).toBe(2);
    expect(rows()[0].textContent).toContain('Alice Dupont');
    expect(rows()[0].textContent).toContain('alice@example.com');
    expect(element().textContent).toContain('2 utilisateurs');
  });

  it('propose de créer un compte quand il n’y a aucun utilisateur', () => {
    open();
    flushUsers([]);

    expect(element().textContent).toContain("Aucun utilisateur pour l'instant");
  });

  it("signale une erreur de chargement et permet de réessayer", () => {
    open();
    http.expectOne(USERS_URL).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(element().textContent).toContain('Impossible de charger les utilisateurs');

    button('Réessayer').click();
    flushUsers([ALICE]);

    expect(rows().length).toBe(1);
  });

  it("repère l'utilisateur connecté dans la liste", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
    open();
    flushUsers([ALICE, BOB]);

    expect(rows()[0].textContent).toContain('Vous');
    expect(rows()[1].textContent).not.toContain('Vous');
  });

  it('demande confirmation avant de supprimer', () => {
    open();
    flushUsers([ALICE, BOB]);

    button('Supprimer', rows()[0]).click();
    fixture.detectChanges();

    http.expectNone(`${USERS_URL}/1`);
    expect(element().querySelector('dialog')!.open).toBeTrue();
  });

  it("retire l'utilisateur de la liste une fois supprimé", () => {
    open();
    flushUsers([ALICE, BOB]);

    confirmDeletion(rows()[0]);
    http.expectOne(`${USERS_URL}/1`).flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('Bob Martin');
    expect(element().textContent).toContain('Le compte « Alice Dupont » a été supprimé.');
    expect(element().querySelector('dialog')!.open).toBeFalse();
  });

  it('déconnecte quand on supprime son propre compte', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
    open();
    flushUsers([ALICE, BOB]);

    confirmDeletion(rows()[0]);
    http.expectOne(`${USERS_URL}/1`).flush(null, { status: 204, statusText: 'No Content' });

    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
  });

  it("conserve la session quand on supprime le compte de quelqu'un d'autre", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE));
    open();
    flushUsers([ALICE, BOB]);

    confirmDeletion(rows()[1]);
    http.expectOne(`${USERS_URL}/2`).flush(null, { status: 204, statusText: 'No Content' });

    expect(TestBed.inject(AuthService).currentUser()).toEqual(ALICE);
  });

  it("conserve l'utilisateur et affiche l'erreur si la suppression échoue", () => {
    open();
    flushUsers([ALICE]);

    confirmDeletion(rows()[0]);
    http.expectOne(`${USERS_URL}/1`).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(element().querySelector('dialog')!.textContent).toContain('La suppression a échoué');
  });
});
