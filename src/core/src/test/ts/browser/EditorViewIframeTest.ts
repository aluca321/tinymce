import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import EditorView from 'tinymce/core/EditorView';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorViewIframeTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  var isPhantomJs = function () {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  var getIframeClientRect = function (editor) {
    return SelectorFind.descendant(Element.fromDom(editor.getContentAreaContainer()), 'iframe').map(function (elm) {
      return elm.dom().getBoundingClientRect();
    }).getOrDie();
  };

  var sSetBodyStyles = function (editor, css) {
    return Step.sync(function () {
      Css.setAll(Element.fromDom(editor.getBody()), css);
    });
  };

  var sTestIsXYInContentArea = function (editor) {
    return Step.sync(function () {
      var rect = getIframeClientRect(editor);

      Assertions.assertEq(
        'Should be inside the area since the scrollbars are excluded',
        true,
        EditorView.isXYInContentArea(editor, rect.width - 25, rect.height - 25)
      );

      Assertions.assertEq(
        'Should be outside the area since the cordinate is on the scrollbars',
        false,
        EditorView.isXYInContentArea(editor, rect.width - 5, rect.height - 5)
      );
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, isPhantomJs() ? [] : [
      Logger.t('isXYInContentArea without borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '0', margin: '0' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor)
      ])),

      Logger.t('isXYInContentArea with borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor)
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

