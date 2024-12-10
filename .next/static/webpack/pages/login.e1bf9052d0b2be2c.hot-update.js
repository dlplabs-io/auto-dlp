"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/login",{

/***/ "./src/pages/login.tsx":
/*!*****************************!*\
  !*** ./src/pages/login.tsx ***!
  \*****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Login; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/esm/index.mjs\");\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dimo-network/login-with-dimo */ \"./node_modules/@dimo-network/login-with-dimo/dist/index.js\");\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nfunction Login() {\n    _s();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const { isAuthenticated, getValidJWT, email, walletAddress, getEmail } = (0,_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.useDimoAuthState)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (isAuthenticated) {\n            router.push(\"/\");\n        }\n    }, [\n        isAuthenticated,\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Container, {\n        maxW: \"container.sm\",\n        py: 10,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.VStack, {\n            spacing: 8,\n            align: \"center\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Heading, {\n                    size: \"xl\",\n                    children: \"Welcome to Auto DLP\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 31,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: \"Sign in with your DIMO account to continue\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 32,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Box, {\n                    w: \"full\",\n                    maxW: \"md\",\n                    p: 8,\n                    borderWidth: 1,\n                    borderRadius: \"lg\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.LoginWithDimo, {\n                        mode: \"popup\",\n                        onSuccess: (authData)=>{\n                            // TODO: do something with authData\n                            // See redirect for `/callback`\n                            router.push(\"/\");\n                        },\n                        onError: (error)=>{\n                            console.error(\"Login Error:\", error);\n                        },\n                        permissionTemplateId: \"1\" // This gives people the option to share _everything_\n                    }, void 0, false, {\n                        fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                        lineNumber: 34,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 33,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n            lineNumber: 30,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n        lineNumber: 29,\n        columnNumber: 5\n    }, this);\n}\n_s(Login, \"Gq+ToVwR65Pm9upKF2yaEQubekg=\", false, function() {\n    return [\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter,\n        _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.useDimoAuthState\n    ];\n});\n_c = Login;\nvar _c;\n$RefreshReg$(_c, \"Login\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvbG9naW4udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFrQztBQU9SO0FBQ3NEO0FBQ3hDO0FBRXpCLFNBQVNTOztJQUN0QixNQUFNQyxTQUFTRixzREFBU0E7SUFDeEIsTUFBTSxFQUNKRyxlQUFlLEVBQ2ZDLFdBQVcsRUFDWEMsS0FBSyxFQUNMQyxhQUFhLEVBQ2JDLFFBQVEsRUFBRyxHQUFHUiwrRUFBZ0JBO0lBR2hDUCxnREFBU0EsQ0FBQztRQUNSLElBQUlXLGlCQUFpQjtZQUNuQkQsT0FBT00sSUFBSSxDQUFDO1FBQ2Q7SUFDRixHQUFHO1FBQUNMO1FBQWlCRDtLQUFPO0lBRTVCLHFCQUNFLDhEQUFDUix1REFBU0E7UUFBQ2UsTUFBSztRQUFlQyxJQUFJO2tCQUNqQyw0RUFBQ2Isb0RBQU1BO1lBQUNjLFNBQVM7WUFBR0MsT0FBTTs7OEJBQ3hCLDhEQUFDakIscURBQU9BO29CQUFDa0IsTUFBSzs4QkFBSzs7Ozs7OzhCQUNuQiw4REFBQ2pCLGtEQUFJQTs4QkFBQzs7Ozs7OzhCQUNOLDhEQUFDSCxpREFBR0E7b0JBQUNxQixHQUFFO29CQUFPTCxNQUFLO29CQUFLTSxHQUFHO29CQUFHQyxhQUFhO29CQUFHQyxjQUFhOzhCQUN6RCw0RUFBQ25CLHdFQUFhQTt3QkFDWm9CLE1BQUs7d0JBQ0xDLFdBQVcsQ0FBQ0M7NEJBQ1YsbUNBQW1DOzRCQUNuQywrQkFBK0I7NEJBQy9CbEIsT0FBT00sSUFBSSxDQUFDO3dCQUNkO3dCQUNBYSxTQUFTLENBQUNDOzRCQUNSQyxRQUFRRCxLQUFLLENBQUMsZ0JBQWdCQTt3QkFDaEM7d0JBQ0FFLHNCQUFxQixJQUFJLHFEQUFxRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU0xRjtHQXRDd0J2Qjs7UUFDUEQsa0RBQVNBO1FBTVJELDJFQUFnQkE7OztLQVBWRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvcGFnZXMvbG9naW4udHN4PzExZTEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgQm94LFxuICBDb250YWluZXIsXG4gIEhlYWRpbmcsXG4gIFRleHQsXG4gIFZTdGFjayxcbn0gZnJvbSAnQGNoYWtyYS11aS9yZWFjdCc7XG5pbXBvcnQgeyBMb2dpbldpdGhEaW1vLCB1c2VEaW1vQXV0aFN0YXRlIH0gZnJvbSAnQGRpbW8tbmV0d29yay9sb2dpbi13aXRoLWRpbW8nO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMb2dpbigpIHtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XG4gIGNvbnN0IHsgICBcbiAgICBpc0F1dGhlbnRpY2F0ZWQsIFxuICAgIGdldFZhbGlkSldULCBcbiAgICBlbWFpbCwgXG4gICAgd2FsbGV0QWRkcmVzcywgXG4gICAgZ2V0RW1haWwgIH0gPSB1c2VEaW1vQXV0aFN0YXRlKCk7XG5cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHJvdXRlci5wdXNoKCcvJyk7XG4gICAgfVxuICB9LCBbaXNBdXRoZW50aWNhdGVkLCByb3V0ZXJdKTtcblxuICByZXR1cm4gKFxuICAgIDxDb250YWluZXIgbWF4Vz1cImNvbnRhaW5lci5zbVwiIHB5PXsxMH0+XG4gICAgICA8VlN0YWNrIHNwYWNpbmc9ezh9IGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgIDxIZWFkaW5nIHNpemU9XCJ4bFwiPldlbGNvbWUgdG8gQXV0byBETFA8L0hlYWRpbmc+XG4gICAgICAgIDxUZXh0PlNpZ24gaW4gd2l0aCB5b3VyIERJTU8gYWNjb3VudCB0byBjb250aW51ZTwvVGV4dD5cbiAgICAgICAgPEJveCB3PVwiZnVsbFwiIG1heFc9XCJtZFwiIHA9ezh9IGJvcmRlcldpZHRoPXsxfSBib3JkZXJSYWRpdXM9XCJsZ1wiPlxuICAgICAgICAgIDxMb2dpbldpdGhEaW1vXG4gICAgICAgICAgICBtb2RlPVwicG9wdXBcIlxuICAgICAgICAgICAgb25TdWNjZXNzPXsoYXV0aERhdGEpID0+IHtcbiAgICAgICAgICAgICAgLy8gVE9ETzogZG8gc29tZXRoaW5nIHdpdGggYXV0aERhdGFcbiAgICAgICAgICAgICAgLy8gU2VlIHJlZGlyZWN0IGZvciBgL2NhbGxiYWNrYFxuICAgICAgICAgICAgICByb3V0ZXIucHVzaCgnLycpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uRXJyb3I9eyhlcnJvcikgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTG9naW4gRXJyb3I6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBwZXJtaXNzaW9uVGVtcGxhdGVJZD1cIjFcIiAvLyBUaGlzIGdpdmVzIHBlb3BsZSB0aGUgb3B0aW9uIHRvIHNoYXJlIF9ldmVyeXRoaW5nX1xuICAgICAgICAgIC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9WU3RhY2s+XG4gICAgPC9Db250YWluZXI+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlRWZmZWN0IiwiQm94IiwiQ29udGFpbmVyIiwiSGVhZGluZyIsIlRleHQiLCJWU3RhY2siLCJMb2dpbldpdGhEaW1vIiwidXNlRGltb0F1dGhTdGF0ZSIsInVzZVJvdXRlciIsIkxvZ2luIiwicm91dGVyIiwiaXNBdXRoZW50aWNhdGVkIiwiZ2V0VmFsaWRKV1QiLCJlbWFpbCIsIndhbGxldEFkZHJlc3MiLCJnZXRFbWFpbCIsInB1c2giLCJtYXhXIiwicHkiLCJzcGFjaW5nIiwiYWxpZ24iLCJzaXplIiwidyIsInAiLCJib3JkZXJXaWR0aCIsImJvcmRlclJhZGl1cyIsIm1vZGUiLCJvblN1Y2Nlc3MiLCJhdXRoRGF0YSIsIm9uRXJyb3IiLCJlcnJvciIsImNvbnNvbGUiLCJwZXJtaXNzaW9uVGVtcGxhdGVJZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/login.tsx\n"));

/***/ })

});