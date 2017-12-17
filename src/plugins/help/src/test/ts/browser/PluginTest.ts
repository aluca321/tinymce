import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyDom } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import { Html } from '@ephox/sugar';
import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.plugin.PluginTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();
  HelpPlugin();
  LinkPlugin();

  var sAssertPluginList = function (html) {
    return Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Could not find notification', 'div.mce-floatpanel ul'),
      Chain.mapper(Html.get),
      Assertions.cAssertHtml('Plugin list html does not match', html)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click on button', 'button'),
      sAssertPluginList('<li><a href="https://www.tinymce.com/docs/plugins/help" target="_blank" rel="noopener">Help</a></li><li><a href="https://www.tinymce.com/docs/plugins/link" target="_blank" rel="noopener">Link</a></li>')
    ], onSuccess, onFailure);
  }, {
    plugins: 'help link',
    toolbar: 'help',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

