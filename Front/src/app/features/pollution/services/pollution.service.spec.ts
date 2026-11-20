import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PollutionDeclaration } from '../models/pollution.model';
import { PollutionService } from './pollution.service';

const POLLUTIONS_URL = `${environment.apiUrl}/pollutions`;
const DECLARATION: PollutionDeclaration = {
  title: 'Sacs plastiques',
  type: 'plastique',
  description: 'Une vingtaine de sacs échoués.',
  observedAt: '2026-10-18',
  place: 'Marseille',
  latitude: 43.26,
  longitude: 5.37,
  dangerLevel: 42,
  photoUrl: null,
  photoFile: null,
};

describe('PollutionService', () => {
  let service: PollutionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PollutionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('liste les pollutions', () => {
    service.getAll().subscribe();

    const request = http.expectOne(POLLUTIONS_URL);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it("récupère le détail d'une pollution", () => {
    service.getById(3).subscribe();

    const request = http.expectOne(`${POLLUTIONS_URL}/3`);
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('crée une pollution en multipart, sans champ pour une photo absente', () => {
    service.create(DECLARATION).subscribe();

    const request = http.expectOne(POLLUTIONS_URL);
    const body = request.request.body as FormData;
    expect(request.request.method).toBe('POST');
    expect(body.get('title')).toBe(DECLARATION.title);
    expect(body.get('latitude')).toBe('43.26');
    expect(body.get('dangerLevel')).toBe('42');
    expect(body.has('photoUrl')).toBeFalse();
    expect(body.has('photo')).toBeFalse();
    request.flush({});
  });

  it('joint le fichier importé', () => {
    const photoFile = new File(['x'], 'photo.png', { type: 'image/png' });
    service.create({ ...DECLARATION, photoFile }).subscribe();

    const request = http.expectOne(POLLUTIONS_URL);
    expect((request.request.body as FormData).get('photo')).toBeInstanceOf(File);
    request.flush({});
  });

  it('modifie une pollution', () => {
    service.update(3, DECLARATION).subscribe();

    const request = http.expectOne(`${POLLUTIONS_URL}/3`);
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('supprime une pollution', () => {
    service.delete(3).subscribe();

    const request = http.expectOne(`${POLLUTIONS_URL}/3`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
