import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import DataToHtml from 'tinymce/plugins/media/core/DataToHtml';
import Plugin from 'tinymce/plugins/media/Plugin';
import Utils from '../module/test/Utils';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.core.DataToHtmlTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  var sTestDataToHtml = function (editor, data, expected) {
    var actual = Element.fromHtml(DataToHtml.dataToHtml(editor, data));

    return Waiter.sTryUntil('Wait for structure check',
      Assertions.sAssertStructure('Assert equal', expected, actual),
      10, 500);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    var videoStruct = ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('video', {
        children: [
          s.text(str.is('\n')),
          s.element('source', {
            attrs: {
              src: str.is('a')
            }
          }),
          s.text(str.is('\n'))
        ],
        attrs: {
          height: str.is('150'),
          width: str.is('300')
        }
      });
    });

    var iframeStruct = ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('iframe', {
        attrs: {
          height: str.is('150'),
          width: str.is('300')
        }
      });
    });

    Pipeline.async({}, [
      sTestDataToHtml(editor,
        {
          type: 'video',
          source1: 'a',
          source2: '',
          poster: '',
          "data-ephox-embed": 'a'
        },
        videoStruct),
      sTestDataToHtml(editor,
        {
          type: 'iframe',
          source1: 'a',
          source2: '',
          poster: '',
          "data-ephox-embed": 'a'
        },
        iframeStruct)
    ], onSuccess, onFailure);
  }, {
    plugins: ["media"],
    toolbar: "media",
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

