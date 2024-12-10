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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Login; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/esm/index.mjs\");\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dimo-network/login-with-dimo */ \"./node_modules/@dimo-network/login-with-dimo/dist/index.js\");\n/* harmony import */ var _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nfunction Login() {\n    _s();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const { isAuthenticated, getValidJWT, email, walletAddress, getEmail } = (0,_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.useDimoAuthState)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // If already authenticated, redirect to home\n        if (authState.isAuthenticated) {\n            router.push(\"/\");\n        }\n    }, [\n        authState.isAuthenticated,\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Container, {\n        maxW: \"container.sm\",\n        py: 10,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.VStack, {\n            spacing: 8,\n            align: \"center\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Heading, {\n                    size: \"xl\",\n                    children: \"Welcome to Vehicle DLP\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 30,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    children: \"Sign in with your DIMO account to continue\"\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 31,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Box, {\n                    w: \"full\",\n                    maxW: \"md\",\n                    p: 8,\n                    borderWidth: 1,\n                    borderRadius: \"lg\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.LoginWithDimo, {\n                        mode: \"popup\",\n                        onSuccess: ()=>{\n                            // Redirect will be handled by useDimoAuthState\n                            router.push(\"/\");\n                        },\n                        onError: (error)=>{\n                            console.error(\"Login Error:\", error);\n                        },\n                        permissionTemplateId: \"1\"\n                    }, void 0, false, {\n                        fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                        lineNumber: 33,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n                    lineNumber: 32,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n            lineNumber: 29,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/lolchocotaco/src/github.com/lolchocotaco/vehicle-dlp/src/pages/login.tsx\",\n        lineNumber: 28,\n        columnNumber: 5\n    }, this);\n}\n_s(Login, \"Gq+ToVwR65Pm9upKF2yaEQubekg=\", false, function() {\n    return [\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter,\n        _dimo_network_login_with_dimo__WEBPACK_IMPORTED_MODULE_2__.useDimoAuthState\n    ];\n});\n_c = Login;\nvar _c;\n$RefreshReg$(_c, \"Login\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvbG9naW4udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFrQztBQU9SO0FBQ3NEO0FBQ3hDO0FBRXpCLFNBQVNTOztJQUN0QixNQUFNQyxTQUFTRixzREFBU0E7SUFDeEIsTUFBTSxFQUNKRyxlQUFlLEVBQ2ZDLFdBQVcsRUFDWEMsS0FBSyxFQUNMQyxhQUFhLEVBQ2JDLFFBQVEsRUFBRyxHQUFHUiwrRUFBZ0JBO0lBQ2hDUCxnREFBU0EsQ0FBQztRQUNSLDZDQUE2QztRQUM3QyxJQUFJZ0IsVUFBVUwsZUFBZSxFQUFFO1lBQzdCRCxPQUFPTyxJQUFJLENBQUM7UUFDZDtJQUNGLEdBQUc7UUFBQ0QsVUFBVUwsZUFBZTtRQUFFRDtLQUFPO0lBRXRDLHFCQUNFLDhEQUFDUix1REFBU0E7UUFBQ2dCLE1BQUs7UUFBZUMsSUFBSTtrQkFDakMsNEVBQUNkLG9EQUFNQTtZQUFDZSxTQUFTO1lBQUdDLE9BQU07OzhCQUN4Qiw4REFBQ2xCLHFEQUFPQTtvQkFBQ21CLE1BQUs7OEJBQUs7Ozs7Ozs4QkFDbkIsOERBQUNsQixrREFBSUE7OEJBQUM7Ozs7Ozs4QkFDTiw4REFBQ0gsaURBQUdBO29CQUFDc0IsR0FBRTtvQkFBT0wsTUFBSztvQkFBS00sR0FBRztvQkFBR0MsYUFBYTtvQkFBR0MsY0FBYTs4QkFDekQsNEVBQUNwQix3RUFBYUE7d0JBQ1pxQixNQUFLO3dCQUNMQyxXQUFXOzRCQUNULCtDQUErQzs0QkFDL0NsQixPQUFPTyxJQUFJLENBQUM7d0JBQ2Q7d0JBQ0FZLFNBQVMsQ0FBQ0M7NEJBQ1JDLFFBQVFELEtBQUssQ0FBQyxnQkFBZ0JBO3dCQUNoQzt3QkFDQUUsc0JBQXFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTWpDO0dBcEN3QnZCOztRQUNQRCxrREFBU0E7UUFNUkQsMkVBQWdCQTs7O0tBUFZFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9wYWdlcy9sb2dpbi50c3g/MTFlMSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICBCb3gsXG4gIENvbnRhaW5lcixcbiAgSGVhZGluZyxcbiAgVGV4dCxcbiAgVlN0YWNrLFxufSBmcm9tICdAY2hha3JhLXVpL3JlYWN0JztcbmltcG9ydCB7IExvZ2luV2l0aERpbW8sIHVzZURpbW9BdXRoU3RhdGUgfSBmcm9tICdAZGltby1uZXR3b3JrL2xvZ2luLXdpdGgtZGltbyc7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExvZ2luKCkge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgeyAgIFxuICAgIGlzQXV0aGVudGljYXRlZCwgXG4gICAgZ2V0VmFsaWRKV1QsIFxuICAgIGVtYWlsLCBcbiAgICB3YWxsZXRBZGRyZXNzLCBcbiAgICBnZXRFbWFpbCAgfSA9IHVzZURpbW9BdXRoU3RhdGUoKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBJZiBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQsIHJlZGlyZWN0IHRvIGhvbWVcbiAgICBpZiAoYXV0aFN0YXRlLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgcm91dGVyLnB1c2goJy8nKTtcbiAgICB9XG4gIH0sIFthdXRoU3RhdGUuaXNBdXRoZW50aWNhdGVkLCByb3V0ZXJdKTtcblxuICByZXR1cm4gKFxuICAgIDxDb250YWluZXIgbWF4Vz1cImNvbnRhaW5lci5zbVwiIHB5PXsxMH0+XG4gICAgICA8VlN0YWNrIHNwYWNpbmc9ezh9IGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgIDxIZWFkaW5nIHNpemU9XCJ4bFwiPldlbGNvbWUgdG8gVmVoaWNsZSBETFA8L0hlYWRpbmc+XG4gICAgICAgIDxUZXh0PlNpZ24gaW4gd2l0aCB5b3VyIERJTU8gYWNjb3VudCB0byBjb250aW51ZTwvVGV4dD5cbiAgICAgICAgPEJveCB3PVwiZnVsbFwiIG1heFc9XCJtZFwiIHA9ezh9IGJvcmRlcldpZHRoPXsxfSBib3JkZXJSYWRpdXM9XCJsZ1wiPlxuICAgICAgICAgIDxMb2dpbldpdGhEaW1vXG4gICAgICAgICAgICBtb2RlPVwicG9wdXBcIlxuICAgICAgICAgICAgb25TdWNjZXNzPXsoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFJlZGlyZWN0IHdpbGwgYmUgaGFuZGxlZCBieSB1c2VEaW1vQXV0aFN0YXRlXG4gICAgICAgICAgICAgIHJvdXRlci5wdXNoKCcvJyk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25FcnJvcj17KGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dpbiBFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHBlcm1pc3Npb25UZW1wbGF0ZUlkPVwiMVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L1ZTdGFjaz5cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJCb3giLCJDb250YWluZXIiLCJIZWFkaW5nIiwiVGV4dCIsIlZTdGFjayIsIkxvZ2luV2l0aERpbW8iLCJ1c2VEaW1vQXV0aFN0YXRlIiwidXNlUm91dGVyIiwiTG9naW4iLCJyb3V0ZXIiLCJpc0F1dGhlbnRpY2F0ZWQiLCJnZXRWYWxpZEpXVCIsImVtYWlsIiwid2FsbGV0QWRkcmVzcyIsImdldEVtYWlsIiwiYXV0aFN0YXRlIiwicHVzaCIsIm1heFciLCJweSIsInNwYWNpbmciLCJhbGlnbiIsInNpemUiLCJ3IiwicCIsImJvcmRlcldpZHRoIiwiYm9yZGVyUmFkaXVzIiwibW9kZSIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJlcnJvciIsImNvbnNvbGUiLCJwZXJtaXNzaW9uVGVtcGxhdGVJZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/login.tsx\n"));

/***/ })

});