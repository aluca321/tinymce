// import { Chain } from '@ephox/agar';
// import { Keys } from '@ephox/agar';
// import { Pipeline } from '@ephox/agar';
// import { RawAssertions } from '@ephox/agar';
// import { Step } from '@ephox/agar';
// import { TinyActions } from '@ephox/mcagar';
// import { TinyApis } from '@ephox/mcagar';
// import { TinyLoader } from '@ephox/mcagar';
// import LinkPlugin from 'tinymce/plugins/link/Plugin';
// import InliteTheme from 'tinymce/themes/inlite/Theme';
// import Toolbar from 'tinymce/themes/inlite/test/Toolbar';
// import { UnitTest } from '@ephox/bedrock';

// UnitTest.asynctest('browser.ClosedDialogScrollTest', function() {
//   var success = arguments[arguments.length - 2];
//   var failure = arguments[arguments.length - 1];

//   InliteTheme();
//   LinkPlugin();

//   TinyLoader.setup(function (editor, onSuccess, onFailure) {
//     var tinyApis = TinyApis(editor);
//     var tinyActions = TinyActions(editor);
//     Pipeline.async({}, [
//       tinyApis.sFocus,
//       tinyApis.sSetContent('<p style="height: 5000px">a</p><p>b</p>'),
//       tinyApis.sSetSelection([1], 0, [1], 1),
//       tinyActions.sContentKeystroke(Keys.space(), {}),
//       Chain.asStep({}, [
//         Toolbar.cWaitForToolbar,
//         Toolbar.cClickButton('Insert/Edit link')
//       ]),
//       tinyActions.sUiKeydown(Keys.enter(), {}),
//       Step.sync(function () {
//         var offset = window.pageYOffset;

//         RawAssertions.assertEq('Should not be at top', offset > 0, true);
//       })
//     ], onSuccess, onFailure);
//   }, {
//     theme: 'inlite',
//     plugins: 'link',
//     insert_toolbar: 'quickimage media quicktable',
//     selection_toolbar: 'bold italic | quicklink h1 h2 blockquote',
//     inline: true,
//     skin_url: '/project/src/skins/lightgray/dist/lightgray'
//   }, success, failure);
// });

