import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Bidi from 'tinymce/core/text/Bidi';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('atomic.tinymce.core.text.BidiTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var sTestHasStrongRtl = Step.sync(function () {
    Assertions.assertEq('Hebrew is strong rtl', true, Bidi.hasStrongRtl('\u05D4\u05E7\u05D3\u05E9'));
    Assertions.assertEq('Abc is not strong rtl', false, Bidi.hasStrongRtl('abc'));
    Assertions.assertEq('Dots are neutral', false, Bidi.hasStrongRtl('.'));
  });

  Pipeline.async({}, [
    sTestHasStrongRtl
  ], function () {
    success();
  }, failure);
});

