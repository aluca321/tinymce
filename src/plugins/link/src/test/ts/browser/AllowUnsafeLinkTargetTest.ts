import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var ui = TinyUi(editor);
    var api = TinyApis(editor);

    var sEnterUrl = function (url) {
      return Step.sync(function () {
        var input: any = document.activeElement;

        input.value = url;
        DOMUtils.DOM.fire(input, 'change');
      });
    };

    var sInsertLink = function (url) {
      return GeneralSteps.sequence([
        ui.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        ui.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
        sEnterUrl(url),
        ui.sClickOnUi('click ok button', 'button:contains("Ok")')
      ]);
    };

    var getDialogByElement = function (element) {
      return Arr.find(editor.windowManager.getWindows(), function (win) {
        return element.dom().id === win._id;
      });
    };

    var cAssertDialogContents = function (data) {
      return Chain.on(function (element, next, die) {
        getDialogByElement(element).fold(die, function (win) {
          Assertions.assertEq('asserting dialog contents', data, win.toJSON());
          next(Chain.wrap(element));
        });
      });
    };


    Pipeline.async({}, [
      Logger.t("doesn't add rel noopener stuff with allow_unsafe_link_target: true", GeneralSteps.sequence([
        api.sSetSetting('allow_unsafe_link_target', true),
        sInsertLink('http://www.google.com'),
        api.sAssertContentPresence({ 'a[rel="noopener"]': 0, 'a': 1 }),
        api.sSetContent('')
      ])),

      Logger.t("adds if allow_unsafe_link_target: false", GeneralSteps.sequence([
        api.sSetSetting('allow_unsafe_link_target', false),
        sInsertLink('http://www.google.com'),
        api.sAssertContentPresence({ 'a[rel="noopener"]': 1 }),
        api.sSetContent('')
      ])),

      Logger.t("...and if it's undefined", GeneralSteps.sequence([
        api.sSetSetting('allow_unsafe_link_target', undefined),
        sInsertLink('http://www.google.com'),
        api.sAssertContentPresence({ 'a[rel="noopener"]': 1 })
      ])),

      Logger.t("allow_unsafe_link_target=false: node filter normalizes and secures rel on SetContent", GeneralSteps.sequence([
        api.sSetSetting('allow_unsafe_link_target', false),
        api.sSetContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>'),
        api.sAssertContent('<p><a href="http://www.google.com" target="_blank" rel="alternate nofollow noopener">Google</a></p>'),
        api.sSetContent('')
      ])),

      Logger.t("allow_unsafe_link_target=false: proper option selected for defined rel_list", GeneralSteps.sequence([
        api.sSetSetting('allow_unsafe_link_target', false),
        api.sSetSetting('rel_list', [
          { title: 'Lightbox', value: 'lightbox' },
          { title: 'Test rel', value: 'alternate nofollow' },
          { title: 'Table of contents', value: 'toc' }
        ]),
        api.sSetContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>'),
        api.sSelect('p', [0]),
        ui.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        Chain.asStep({}, [
          ui.cWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
          cAssertDialogContents({
            text: "Google",
            title: "",
            href: "http://www.google.com",
            target: "_blank",
            rel: "alternate nofollow noopener"
          })
        ]),
        ui.sClickOnUi('click ok button', 'button:contains("Ok")')
      ]))

    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/src/skins/lightgray/dist/lightgray',
    target_list: [
      { title: 'New page', value: '_blank' }
    ]
  }, success, failure);
});

