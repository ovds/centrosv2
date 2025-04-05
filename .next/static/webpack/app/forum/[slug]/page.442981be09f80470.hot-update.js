/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/forum/[slug]/page",{

/***/ "(app-pages-browser)/./app/forum/[slug]/DiscussionDetailClient.tsx":
/*!*****************************************************!*\
  !*** ./app/forum/[slug]/DiscussionDetailClient.tsx ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports on update so we can compare the boundary
                // signatures.
                module.hot.dispose(function (data) {
                    data.prevExports = currentExports;
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevExports !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevExports !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ }),

/***/ "(app-pages-browser)/./app/forum/[slug]/page.tsx":
/*!***********************************!*\
  !*** ./app/forum/[slug]/page.tsx ***!
  \***********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ DiscussionDetailPage; },\n/* harmony export */   generateStaticParams: function() { return /* binding */ generateStaticParams; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var _data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../data */ \"(app-pages-browser)/./app/forum/data.ts\");\n/* harmony import */ var _DiscussionDetailClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DiscussionDetailClient */ \"(app-pages-browser)/./app/forum/[slug]/DiscussionDetailClient.tsx\");\n/* harmony import */ var _DiscussionDetailClient__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_DiscussionDetailClient__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n// This function is needed for static site generation with dynamic routes\nfunction generateStaticParams() {\n    return _data__WEBPACK_IMPORTED_MODULE_1__.discussionsData.map((discussion)=>({\n            slug: discussion.slug\n        }));\n}\nfunction DiscussionDetailPage(param) {\n    let { params } = param;\n    const discussion = _data__WEBPACK_IMPORTED_MODULE_1__.discussionsData.find((d)=>d.slug === params.slug);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((_DiscussionDetailClient__WEBPACK_IMPORTED_MODULE_2___default()), {\n        initialDiscussion: discussion\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\krish\\\\cursor-projects\\\\centrosv2\\\\app\\\\forum\\\\[slug]\\\\page.tsx\",\n        lineNumber: 18,\n        columnNumber: 10\n    }, this);\n}\n_c = DiscussionDetailPage;\nvar _c;\n$RefreshReg$(_c, \"DiscussionDetailPage\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9mb3J1bS9bc2x1Z10vcGFnZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUF5QztBQUVvQjtBQUU3RCx5RUFBeUU7QUFDbEUsU0FBU0U7SUFDZCxPQUFPRixrREFBZUEsQ0FBQ0csR0FBRyxDQUFDLENBQUNDLGFBQWdCO1lBQzFDQyxNQUFNRCxXQUFXQyxJQUFJO1FBQ3ZCO0FBQ0Y7QUFNZSxTQUFTQyxxQkFBcUIsS0FBcUI7UUFBckIsRUFBRUMsTUFBTSxFQUFhLEdBQXJCO0lBQzNDLE1BQU1ILGFBQWFKLGtEQUFlQSxDQUFDUSxJQUFJLENBQUMsQ0FBQ0MsSUFBTUEsRUFBRUosSUFBSSxLQUFLRSxPQUFPRixJQUFJO0lBQ3JFLHFCQUFPLDhEQUFDSixnRUFBc0JBO1FBQUNTLG1CQUFtQk47Ozs7OztBQUNwRDtLQUh3QkUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vYXBwL2ZvcnVtL1tzbHVnXS9wYWdlLnRzeD9hMDllIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRpc2N1c3Npb25zRGF0YSB9IGZyb20gXCIuLi9kYXRhXCJcclxuaW1wb3J0IHsgRGlzY3Vzc2lvbiB9IGZyb20gXCIuLi90eXBlc1wiXHJcbmltcG9ydCBEaXNjdXNzaW9uRGV0YWlsQ2xpZW50IGZyb20gXCIuL0Rpc2N1c3Npb25EZXRhaWxDbGllbnRcIlxyXG5cclxuLy8gVGhpcyBmdW5jdGlvbiBpcyBuZWVkZWQgZm9yIHN0YXRpYyBzaXRlIGdlbmVyYXRpb24gd2l0aCBkeW5hbWljIHJvdXRlc1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTdGF0aWNQYXJhbXMoKSB7XHJcbiAgcmV0dXJuIGRpc2N1c3Npb25zRGF0YS5tYXAoKGRpc2N1c3Npb24pID0+ICh7XHJcbiAgICBzbHVnOiBkaXNjdXNzaW9uLnNsdWcsXHJcbiAgfSkpXHJcbn1cclxuXHJcbmludGVyZmFjZSBQYWdlUHJvcHMge1xyXG4gIHBhcmFtczogeyBzbHVnOiBzdHJpbmcgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBEaXNjdXNzaW9uRGV0YWlsUGFnZSh7IHBhcmFtcyB9OiBQYWdlUHJvcHMpIHtcclxuICBjb25zdCBkaXNjdXNzaW9uID0gZGlzY3Vzc2lvbnNEYXRhLmZpbmQoKGQpID0+IGQuc2x1ZyA9PT0gcGFyYW1zLnNsdWcpXHJcbiAgcmV0dXJuIDxEaXNjdXNzaW9uRGV0YWlsQ2xpZW50IGluaXRpYWxEaXNjdXNzaW9uPXtkaXNjdXNzaW9ufSAvPlxyXG59ICJdLCJuYW1lcyI6WyJkaXNjdXNzaW9uc0RhdGEiLCJEaXNjdXNzaW9uRGV0YWlsQ2xpZW50IiwiZ2VuZXJhdGVTdGF0aWNQYXJhbXMiLCJtYXAiLCJkaXNjdXNzaW9uIiwic2x1ZyIsIkRpc2N1c3Npb25EZXRhaWxQYWdlIiwicGFyYW1zIiwiZmluZCIsImQiLCJpbml0aWFsRGlzY3Vzc2lvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/forum/[slug]/page.tsx\n"));

/***/ })

});