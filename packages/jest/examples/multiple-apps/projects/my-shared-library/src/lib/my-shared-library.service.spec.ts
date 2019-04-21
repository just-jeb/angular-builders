import { TestBed } from '@angular/core/testing';

import { MySharedLibraryService } from './my-shared-library.service';

describe('MySharedLibraryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MySharedLibraryService = TestBed.get(MySharedLibraryService);
    expect(service).toBeTruthy();
  });
});
