const {
  executeHook,
} = require('../utils.js');

/**
 * Render the page, complete with errors.
 *
 * @param {Logger} logger Request-specific logger instance
 * @param {request} req Express request
 * @param {response} res Express response object
 * @param {object} pageMeta Metadata for page being evaluated
 * @param  {object} errors Errors generated by the validation process
 * @return {void}
 */
module.exports = function doRender(logger, req, res, pageMeta, errors) {
  return executeHook(logger, req, res, pageMeta, 'prerender').then(() => {
    if (typeof pageMeta.view !== 'string') {
      res.status(500).send('500 Internal Server Error (page template undefined)');
    } else {
      // Modify errors to conform to requirements of the new `error-summary`
      // Nunjucks macro, which is a basic array.
      // ref: https://github.com/alphagov/govuk-frontend/tree/master/package/components/error-summary
      // Ideally we'd have done this in Nunjucks, but doesn't appear possible.
      // We retain `formErrors` because other places need the errors keyed with
      // the field name.
      // The `f-` prefix on the error href reflects the use of an `f-` prefix on
      // the `id` attribute of each input field.
      // The first `focusSuffix` entry (if present) is appended to the
      // error link in order to highlight the specific input that is in error.
      const govukErrors = Object.keys(errors || {}).map(k => ({
        text: req.i18nTranslator.t(errors[k][0].summary),
        href: errors[k][0].fieldHref,
      }));

      res.render(pageMeta.view, {
        formData: req.body,
        formErrors: errors,
        formErrorsGovukArray: govukErrors,
        inEditMode: req.inEditMode,
        editOriginUrl: req.editOriginUrl,
      });
    }
  });
};