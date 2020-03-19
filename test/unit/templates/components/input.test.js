const npath = require('path');
const { expect } = require('chai');
const helpers = require('../helpers');

const dirMacros = npath.resolve(__dirname);

describe('casaGovukInput macro', () => {
  /**
   * Build a DOM object.
   *
   * @param {Object} params Parameters with which to render the template
   * @return {Object} DOM element (cheerio)
   */
  function buildDom(params = {}) {
    const p = Object.assign({
      name: null,
      value: null,
      casaErrors: null,
    }, params || {});
    return helpers.renderTemplateFile(`${dirMacros}/input.njk`, {
      params: p,
    });
  }

  /* ----------------------------------------------------------- Basic markup */

  describe('Basic', () => {
    let $;

    before(() => {
      $ = buildDom({
        name: 'TEST',
        value: 'some-value',
      });
    });

    it('should have an id prefixed with f-', () => expect($('input').attr('id')).to.equal('f-TEST'));

    it('should have a correct name attribute', () => expect($('input').attr('name')).to.equal('TEST'));

    it('should have a correct value attribute', () => expect($('input').attr('value')).to.equal('some-value'));
  });

  /* ----------------------------------------------------------------- Errors */

  describe('Errors', () => {
    let $;

    before(() => {
      $ = buildDom({
        name: 'errtest',
        casaErrors: {
          errtest: [{
            inline: 'Test Error Message ${var}',
            variables: { var: 'TEST_VAR' },
          }],
        },
      });
    });

    it('should have a error message with correct id', () => expect($('.govuk-error-message').attr('id')).to.equal('f-errtest-error'));

    it('should have correct error mesage', () => expect($('.govuk-error-message').text().trim()).to.equal('Error: Test Error Message TEST_VAR'));

    it('should have a data-valdiation attribute', () => expect($('input').attr('data-validation')).to.equal('{"fn":"errtest"}'));
  });
});
