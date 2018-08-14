import { TestBed, inject } from '@angular/core/testing';

import { MyLibService } from './my-lib.service';

describe('MyLibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyLibService]
    });
  });

  it('should be created', inject([MyLibService], (service: MyLibService) => {
    expect(service).toBeTruthy();
  }));
});
