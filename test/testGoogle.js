module.exports = {
  'Demo test Google': function (browser) {
    browser
      .url('http://localhost:16006/something')
      .waitForElementVisible('body', 100)
      .setValue('input[type=text]', 'nightwatch')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[name=btnG]')
      .pause(1000)
      .assert.containsText('#main', 'Night Watch')
      .end();
  }
};
