import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getDivText() {
    return element(by.css('body>div')).getText();
  }
}
