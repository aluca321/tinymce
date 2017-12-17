import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import GetSelectionContent from 'tinymce/core/selection/GetSelectionContent';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.selection.GetSelectionContentTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  var cGetContent = function (args) {
    return Chain.mapper(function (editor) {
      return GetSelectionContent.getContent(editor, args);
    });
  };

  var sAssertGetContent = function (label, editor, expectedContents) {
    return Chain.asStep(editor, [
      cGetContent({}),
      Assertions.cAssertEq('Should be expected contents', expectedContents)
    ]);
  };

  var sAssertGetContentOverrideBeforeGetContent = function (label, editor, expectedContents) {
    var handler = function (e) {
      if (e.selection === true) {
        e.preventDefault();
        e.content = expectedContents;
      }
    };

    return GeneralSteps.sequence([
      Step.sync(function () {
        editor.on('BeforeGetContent', handler);
      }),
      Chain.asStep(editor, [
        cGetContent({}),
        Assertions.cAssertEq('Should be expected contents', expectedContents)
      ]),
      Step.sync(function () {
        editor.off('BeforeGetContent', handler);
      })
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Should be empty contents on a caret selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sAssertGetContent('Should be empty selection on caret', editor, '')
      ])),
      Logger.t('Should be text contents on a range selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertGetContent('Should be some content', editor, 'a')
      ])),
      Logger.t('Should be text contents provided by override handler', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertGetContentOverrideBeforeGetContent('Should be overridden content', editor, 'X')
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

