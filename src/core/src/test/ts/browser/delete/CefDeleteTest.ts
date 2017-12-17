import { ApproxStructure } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.CefDeleteTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  var sKeyUp = function (editor, key) {
    var iDoc = Element.fromDom(editor.getDoc());
    return Keyboard.sKeyup(iDoc, key, {});
  };

  var sFakeBackspaceKeyOnRange = function (editor) {
    return GeneralSteps.sequence([
      Step.sync(function () {
        editor.getDoc().execCommand('Delete', false, null);
      }),
      sKeyUp(editor, Keys.backspace())
    ]);
  };

  var sTestDeletePadd = function (editor, tinyApis, tinyActions) {
    return GeneralSteps.sequence([
      tinyApis.sFocus,
      Logger.t('Should padd empty ce=true inside ce=false when everything is deleted', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">a</p>b</div>'),
        tinyApis.sSetSelection([0, 1, 0], 0, [0, 1, 0], 1),
        sFakeBackspaceKeyOnRange(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.text(str.is('a')),
                    s.element('p', {
                      children: [
                        s.element('br', {
                          attrs: {
                            'data-mce-bogus': str.is('1')
                          }
                        })
                      ]
                    }),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should not padd an non empty ce=true inside ce=false', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">ab</p>b</div>'),
        tinyApis.sSetSelection([0, 1, 0], 0, [0, 1, 0], 1),
        sFakeBackspaceKeyOnRange(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.text(str.is('a')),
                    s.element('p', {
                      children: [
                        s.text(str.is('b'))
                      ]
                    }),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should padd editor with paragraph and br if the editor is empty after delete of a cef element', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div>'),
        tinyApis.sSetSelection([], 0, [], 1),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0], 0, [0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {
                      attrs: {
                        'data-mce-bogus': str.is('1')
                      }
                    })
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should padd editor with empty paragraph if we delete last element', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div>'),
        tinyApis.sSetSelection([], 1, [], 1),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0], 0, [0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {
                      attrs: {
                        'data-mce-bogus': str.is('1')
                      }
                    })
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should remove fake caret if we delete block cef', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div><p>b</p>'),
        tinyApis.sSetSelection([], 1, [], 1),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ]))
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      sTestDeletePadd(editor, tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

