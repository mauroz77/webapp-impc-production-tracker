import { TestBed } from '@angular/core/testing';

import { ConfigurationDataService } from './configuration-data.service';

describe('ConfigurationDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfigurationDataService = TestBed.inject(ConfigurationDataService);
    expect(service).toBeTruthy();
  });
});
