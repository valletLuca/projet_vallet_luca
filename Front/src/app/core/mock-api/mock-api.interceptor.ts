import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pollution, PollutionType } from '../../features/pollution/models/pollution.model';
import { MOCK_POLLUTIONS } from './mock-pollutions';

const BASE_URL = `${environment.apiUrl}/pollutions`;
const ID_PATH = /^(?:\/(\d+))?$/;

// Données gardées en mémoire : elles sont réinitialisées à chaque rechargement de la page.
let pollutions: Pollution[] = MOCK_POLLUTIONS.map((pollution) => ({ ...pollution }));
let nextId = Math.max(...pollutions.map((p) => p.id)) + 1;

/**
 * Backend simulé : répond aux requêtes `/pollutions` à la place de l'API.
 * Activé par `environment.mockApi` (voir app.config.ts).
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const match = req.url.startsWith(BASE_URL) ? ID_PATH.exec(req.url.slice(BASE_URL.length)) : null;
  if (!match) {
    return next(req);
  }
  const id = match[1] ? Number(match[1]) : null;

  if (id === null) {
    switch (req.method) {
      case 'GET':
        return respond(200, pollutions.map((p) => ({ ...p })));
      case 'POST': {
        const created: Pollution = {
          ...fromFormData(req),
          id: nextId++,
          createdAt: new Date().toISOString(),
        };
        pollutions = [...pollutions, created];
        return respond(201, { ...created });
      }
    }
    return fail(req, 405, 'Method Not Allowed');
  }

  const existing = pollutions.find((p) => p.id === id);
  if (!existing) {
    return fail(req, 404, 'Not Found');
  }

  switch (req.method) {
    case 'GET':
      return respond(200, { ...existing });
    case 'PUT': {
      const updated: Pollution = { ...fromFormData(req), id, createdAt: existing.createdAt };
      pollutions = pollutions.map((p) => (p.id === id ? updated : p));
      return respond(200, { ...updated });
    }
    case 'DELETE':
      pollutions = pollutions.filter((p) => p.id !== id);
      return respond(204, null);
  }
  return fail(req, 405, 'Method Not Allowed');
};

function respond<T>(status: number, body: T): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body }));
}

function fail(req: HttpRequest<unknown>, status: number, statusText: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, statusText, url: req.url }));
}

/** Lit le multipart envoyé par PollutionService ; la photo importée devient une URL. */
function fromFormData(req: HttpRequest<unknown>): Omit<Pollution, 'id' | 'createdAt'> {
  const body = req.body as FormData;
  const text = (key: string) => String(body.get(key) ?? '');
  const photo = body.get('photo');

  return {
    title: text('title'),
    type: text('type') as PollutionType,
    description: text('description'),
    observedAt: text('observedAt'),
    place: text('place'),
    latitude: Number(text('latitude')),
    longitude: Number(text('longitude')),
    photoUrl: photo instanceof File ? URL.createObjectURL(photo) : text('photoUrl') || null,
  };
}
