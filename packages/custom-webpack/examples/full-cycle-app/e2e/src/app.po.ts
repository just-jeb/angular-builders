import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getDivText() {
    return element(by.css('body>div')).getText();
  }

  getParagraphText() {
    return element(by.css('body>p')).getText();
  }

  getVersionText() {
    return element(by.css('body .version')).getText();
  }
}
