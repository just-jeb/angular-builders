import { AppPage } from './app.po';
import {environment} from '../../src/environments/environment';
import {browser, by, element} from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display generated Hello World div when production build', () => {
    page.navigateTo();
    if(environment.production) {
      expect(page.getDivText()).toEqual('Hello world');
    } else {
      expect(element(by.css('body>div')).isPresent()).toBeFalsy();
    }
  });
});
