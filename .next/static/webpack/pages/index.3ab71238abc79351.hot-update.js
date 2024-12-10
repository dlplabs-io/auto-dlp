"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./src/pages/index.tsx":
/*!*****************************!*\
  !*** ./src/pages/index.tsx ***!
  \*****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Home; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/esm/index.mjs\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dimo-network/login-with-dimo */ \"./node_modules/@dimo-network/login-with-dimo/dist/index.js\");\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nfunction Home() {\n    _s();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const { isAuthenticated, getValidJWT, email, walletAddress, getEmail } = (0,_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_3__.useDimoAuthState)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // If not authenticated, redirect to login page\n        if (!isAuthenticated) {\n            router.push(\"/login\");\n        }\n    }, [\n        isAuthenticated,\n        router\n    ]);\n    // If not authenticated, render nothing\n    if (!isAuthenticated) {\n        return null;\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Container, {\n        maxW: \"container.sm\",\n        py: 10,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.VStack, {\n            spacing: 8,\n            align: \"center\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Heading, {\n                    size: \"xl\",\n                    children: \"Welcome to Vehicle DLP\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n                    lineNumber: 35,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: \"You are successfully logged in!\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n                    lineNumber: 36,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: [\n                        \"Email: \",\n                        email\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: [\n                        \"Wallet Address: \",\n                        walletAddress\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n                    lineNumber: 38,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: [\n                        \"Valid JWT: \",\n                        getValidJWT()\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n                    lineNumber: 39,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n            lineNumber: 34,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/index.tsx\",\n        lineNumber: 33,\n        columnNumber: 5\n    }, this);\n}\n_s(Home, \"Gq+ToVwR65Pm9upKF2yaEQubekg=\", false, function() {\n    return [\n        next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter,\n        _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_3__.useDimoAuthState\n    ];\n});\n_c = Home;\nvar _c;\n$RefreshReg$(_c, \"Home\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvaW5kZXgudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFrQztBQU1SO0FBQ2M7QUFDeUI7QUFFbEQsU0FBU087O0lBQ3RCLE1BQU1DLFNBQVNILHNEQUFTQTtJQUN4QixNQUFNLEVBQ0pJLGVBQWUsRUFDZkMsV0FBVyxFQUNYQyxLQUFLLEVBQ0xDLGFBQWEsRUFDYkMsUUFBUSxFQUFHLEdBQUdQLCtFQUFnQkE7SUFFaENOLGdEQUFTQSxDQUFDO1FBQ1IsK0NBQStDO1FBQy9DLElBQUksQ0FBQ1MsaUJBQWlCO1lBQ3BCRCxPQUFPTSxJQUFJLENBQUM7UUFDZDtJQUNGLEdBQUc7UUFBQ0w7UUFBaUJEO0tBQU87SUFFNUIsdUNBQXVDO0lBQ3ZDLElBQUksQ0FBQ0MsaUJBQWlCO1FBQ3BCLE9BQU87SUFDVDtJQUVBLHFCQUNFLDhEQUFDUix1REFBU0E7UUFBQ2MsTUFBSztRQUFlQyxJQUFJO2tCQUNqQyw0RUFBQ1osb0RBQU1BO1lBQUNhLFNBQVM7WUFBR0MsT0FBTTs7OEJBQ3hCLDhEQUFDaEIscURBQU9BO29CQUFDaUIsTUFBSzs4QkFBSzs7Ozs7OzhCQUNuQiw4REFBQ2hCLGtEQUFJQTs4QkFBQzs7Ozs7OzhCQUNOLDhEQUFDQSxrREFBSUE7O3dCQUFDO3dCQUFRUTs7Ozs7Ozs4QkFDZCw4REFBQ1Isa0RBQUlBOzt3QkFBQzt3QkFBaUJTOzs7Ozs7OzhCQUN2Qiw4REFBQ1Qsa0RBQUlBOzt3QkFBQzt3QkFBWU87Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUsxQjtHQWpDd0JIOztRQUNQRixrREFBU0E7UUFNUkMsMkVBQWdCQTs7O0tBUFZDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9wYWdlcy9pbmRleC50c3g/MTlhMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICBDb250YWluZXIsXG4gIEhlYWRpbmcsXG4gIFRleHQsXG4gIFZTdGFjayxcbn0gZnJvbSAnQGNoYWtyYS11aS9yZWFjdCc7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XG5pbXBvcnQgeyB1c2VEaW1vQXV0aFN0YXRlIH0gZnJvbSAnQGRpbW8tbmV0d29yay9sb2dpbi13aXRoLWRpbW8nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBIb21lKCkge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgeyAgIFxuICAgIGlzQXV0aGVudGljYXRlZCwgXG4gICAgZ2V0VmFsaWRKV1QsIFxuICAgIGVtYWlsLCBcbiAgICB3YWxsZXRBZGRyZXNzLCBcbiAgICBnZXRFbWFpbCAgfSA9IHVzZURpbW9BdXRoU3RhdGUoKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIElmIG5vdCBhdXRoZW50aWNhdGVkLCByZWRpcmVjdCB0byBsb2dpbiBwYWdlXG4gICAgaWYgKCFpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHJvdXRlci5wdXNoKCcvbG9naW4nKTtcbiAgICB9XG4gIH0sIFtpc0F1dGhlbnRpY2F0ZWQsIHJvdXRlcl0pO1xuXG4gIC8vIElmIG5vdCBhdXRoZW50aWNhdGVkLCByZW5kZXIgbm90aGluZ1xuICBpZiAoIWlzQXV0aGVudGljYXRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyIG1heFc9XCJjb250YWluZXIuc21cIiBweT17MTB9PlxuICAgICAgPFZTdGFjayBzcGFjaW5nPXs4fSBhbGlnbj1cImNlbnRlclwiPlxuICAgICAgICA8SGVhZGluZyBzaXplPVwieGxcIj5XZWxjb21lIHRvIFZlaGljbGUgRExQPC9IZWFkaW5nPlxuICAgICAgICA8VGV4dD5Zb3UgYXJlIHN1Y2Nlc3NmdWxseSBsb2dnZWQgaW4hPC9UZXh0PlxuICAgICAgICA8VGV4dD5FbWFpbDoge2VtYWlsfTwvVGV4dD5cbiAgICAgICAgPFRleHQ+V2FsbGV0IEFkZHJlc3M6IHt3YWxsZXRBZGRyZXNzfTwvVGV4dD5cbiAgICAgICAgPFRleHQ+VmFsaWQgSldUOiB7Z2V0VmFsaWRKV1QoKX08L1RleHQ+XG4gICAgICAgIHsvKiBBZGQgbW9yZSBjb250ZW50IGZvciB0aGUgYXV0aGVudGljYXRlZCBob21lIHBhZ2UgKi99XG4gICAgICA8L1ZTdGFjaz5cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJDb250YWluZXIiLCJIZWFkaW5nIiwiVGV4dCIsIlZTdGFjayIsInVzZVJvdXRlciIsInVzZURpbW9BdXRoU3RhdGUiLCJIb21lIiwicm91dGVyIiwiaXNBdXRoZW50aWNhdGVkIiwiZ2V0VmFsaWRKV1QiLCJlbWFpbCIsIndhbGxldEFkZHJlc3MiLCJnZXRFbWFpbCIsInB1c2giLCJtYXhXIiwicHkiLCJzcGFjaW5nIiwiYWxpZ24iLCJzaXplIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/index.tsx\n"));

/***/ })

});