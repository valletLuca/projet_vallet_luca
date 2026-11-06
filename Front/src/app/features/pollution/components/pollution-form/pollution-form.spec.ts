import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollutionForm } from './pollution-form';

describe('PollutionForm', () => {
  let fixture: ComponentFixture<PollutionForm>;
  let where: PollutionForm['form']['controls']['where']['controls'];

  beforeEach(() => {
    fixture = TestBed.createComponent(PollutionForm);
    fixture.componentRef.setInput('steps', [
      { title: 'Quoi', description: '' },
      { title: 'Où', description: '' },
      { title: 'Preuve', description: '' },
    ]);
    fixture.detectChanges();
    where = fixture.componentInstance.form.controls.where.controls;
  });

  const cases: [string, 'latitude' | 'longitude', number, boolean][] = [
    ['une latitude de -90', 'latitude', -90, true],
    ['une latitude de 90', 'latitude', 90, true],
    ['une latitude de -90.1', 'latitude', -90.1, false],
    ['une latitude de 90.1', 'latitude', 90.1, false],
    ['une longitude de -180', 'longitude', -180, true],
    ['une longitude de 180', 'longitude', 180, true],
    ['une longitude de -180.1', 'longitude', -180.1, false],
    ['une longitude de 180.1', 'longitude', 180.1, false],
  ];
  for (const [label, field, value, valid] of cases) {
    it(`${valid ? 'accepte' : 'refuse'} ${label}, comme l'API`, () => {
      where[field].setValue(value);

      expect(where[field].valid).toBe(valid);
    });
  }
});
