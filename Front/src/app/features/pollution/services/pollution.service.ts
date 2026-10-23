import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pollution, PollutionDeclaration } from '../models/pollution.model';

/** Accès à l'API REST des pollutions. L'URL dépend de l'environnement (dev / prod). */
@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pollutions`;

  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.baseUrl);
  }

  getById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.baseUrl}/${id}`);
  }

  create(declaration: PollutionDeclaration): Observable<Pollution> {
    return this.http.post<Pollution>(this.baseUrl, toFormData(declaration));
  }

  update(id: number, declaration: PollutionDeclaration): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.baseUrl}/${id}`, toFormData(declaration));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

/** Multipart : seul format qui permet d'envoyer la photo importée avec les autres champs. */
function toFormData(declaration: PollutionDeclaration): FormData {
  const { photoFile, ...fields } = declaration;
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) {
      formData.append(key, String(value));
    }
  }
  if (photoFile) {
    formData.append('photo', photoFile, photoFile.name);
  }
  return formData;
}
