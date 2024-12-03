(function () {
    var option = {};
    var organization = LRObject.util.getQueryParameterByName("org_name", location.search.toLowerCase());
    if(organization){
        LRObject.options.organization = organization.trim();
    }
    
    LRObject.$hooks.register('successCallback', function (action, result) {
        if(window.lr_raas_settings.organization && LRObject.options.isB2BEnabled && LRObject.options.organization){
                if(action === "registrationSchema" && !result.ErrorCode){
                    window.lr_raas_settings.organization.success(result);
                }
                else if(action === "registrationSchema" && result.ErrorCode){
                    window.lr_raas_settings.organization.error(result);
                }	 
        }
    });

    LRObject.$hooks.register('modifyXhrRequest', function (action, xhr, url) {
        if (LRObject.options.isFederationHPALogin && LRObject.options.federationLoginCallback && action === "login") {
            xhr.withCredentials = true
            var fedLoginUrl = LRObject.options.federationLoginCallback;
            if (url.indexOf("?") > -1) {
                fedLoginUrl += "?" + url.split("?")[1]
            }
            xhr.open("post", fedLoginUrl);
        }
    });

    LRObject.util.federationCallbackHandler = function (result) {
        var handledByFederation = false;
        if (result && result.access_token && result.access_token !== "00000000-0000-0000-0000-000000000000") {
            LRObject.documentCookies.removeItem('lr-session-token');
            LRObject.documentCookies.setItem('lr-session-token', result.access_token, '', '/');

            if (LRObject.options.isFederationHPALogin && result.action) {
                if (result.action == "Redirect") {
                    handledByFederation = true;
                    window.location = result.redirectUrl;
                } else if (result.action == "POST") {
                    handledByFederation = true;
                    LRObject.util.postAndRedirect(result.redirectUrl, result.data);
                }
            } else if (LRObject.options.federationTokenCallback) {
                handledByFederation = true;
                LRObject.util.postAndRedirect(LRObject.options.federationTokenCallback, {
                    token: result.access_token
                });
            }
        }
        return handledByFederation;
    }

    LRObject.util.postAndRedirect = function (url, data) {
        var form = document.createElement('form');
        document.body.appendChild(form);
        form.method = 'post';
        form.action = url;
        for (var name in data) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = data[name];
            form.appendChild(input);
        }
        form.submit();
    }

    LRObject.util.isCloudApiPostCallbackSupported = function (value) {
        const ssoCallbacks = [
            ["/sso/jwt/redirect/token/callback"],
            ["/sso/oauth/redirect/callback"],
            ["/sso/oidc/authorize/callback"],
            ["/sso/oidc/", "/authorize/callback"],
            ["/sso/oauth/", "/device/callback"],
            ["/sso/oauth/", "/redirect/callback"],
        ];

        for (var i = 0; i < ssoCallbacks.length; i++) {
            var ssoCallbackUrl = ssoCallbacks[i];
            if (ssoCallbackUrl.length == 1) {
                if (value.indexOf(ssoCallbackUrl[0]) > -1) {
                    return true
                }
            } else {
                if (value.indexOf(ssoCallbackUrl[0]) > -1 && value.indexOf(ssoCallbackUrl[1]) > -1) {
                    return true
                }
            }
        }

        return false
    }

    LRObject.LoginRadiusHostedPage = 'auth';
    var queryString = LRObject.util.parseQueryString(window.location.search.replace("?", ""));
    var sessionToken = LRObject.documentCookies.getItem('lr-session-token');
    var LRSetSafariToken = LRObject.util.getBrowserStorage("LRSetSafariToken");
    if (!LRSetSafariToken && sessionToken && queryString.action != 'logout') {
        sessionToken = sessionToken.replace(/^"(.+)"$/, '$1');
        var sl_data = {}
        var onError = function () { };
        if (window.lr_raas_settings.login && window.lr_raas_settings.login.error) {
          onError = window.lr_raas_settings.login.error;
        }
        sl_data.token = sessionToken;

        var requiredfield_options = {};
        requiredfield_options.onSuccess = function (data) {
            if (data && data.access_token && !LRObject.util.federationCallbackHandler(data)) {
                if (typeof redirectToReturnUrl == "function") {
                    redirectToReturnUrl(sessionToken);
                } else if (window.lr_raas_settings.login) {
                    window.lr_raas_settings.login.success(data);
                }

            }
        };
        requiredfield_options.onError = function (data) {
            onError(data)
        }
        LRObject.setHostedToken = true;
        var callback = function () {
            LRObject.$hooks.register('registrationSchemaFilter', function (schema, profile) {
                if (profile && profile.RegistrationProvider == 'Email' && !LRObject.options.askRequiredFieldForTraditionalLogin) {
                    LRObject.registrationFormSchema = [];
                    var _socialLoginErrorFn = function () { };
                    if (window.lr_raas_settings.sociallogin && window.lr_raas_settings.sociallogin.error) {
                        _socialLoginErrorFn = window.lr_raas_settings.sociallogin.error;
                    }
                    onError = _socialLoginErrorFn;
                } else if (profile && profile.RegistrationProvider != 'Email') {
                    var _loginErrorFn = function () { };
                    if (window.lr_raas_settings.login && window.lr_raas_settings.login.error) {
                        _loginErrorFn = window.lr_raas_settings.login.error;
                    }
                    onError = _loginErrorFn;
                }
            })
        };
        LRObject.getAppConfiguration(callback);
        var container = window.lr_raas_settings && window.lr_raas_settings.sociallogin && window.lr_raas_settings.sociallogin.containerid || '';
        LRObject.api.socialLogin(sl_data, requiredfield_options.onSuccess, requiredfield_options.onError, '', raasoption.registrationFormSchema, container);
    }

    function removeParam(keys, sourceURL) {
        var encoded = sourceURL !== decodeURIComponent(sourceURL);
        if (encoded) {
            sourceURL = decodeURIComponent(sourceURL);
        }
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (keys.indexOf(param) != -1) {
                    params_arr.splice(i, 1);
                }
            }
            if (params_arr.length) {
                rtn = rtn + "?" + params_arr.join("&");
            }
        }
        if (encoded) {
            rtn = encodeURIComponent(rtn);
        }
        return rtn;
    }
    var resetpasswordurl = removeParam(["action"], window.location.href);

    if (resetpasswordurl.charAt(resetpasswordurl.length - 1) == '?' || resetpasswordurl.charAt(resetpasswordurl.length - 1) == '&') {
        resetpasswordurl = resetpasswordurl.substr(0, resetpasswordurl.length - 1);
    }
    var emailverifyurl = window.location.href.replace("action=register&", "");

    raasoption.resetPasswordUrl = (raasoption.forgotPasswordUrl || raasoption.resetPasswordUrl) || encodeURIComponent(resetpasswordurl);
    raasoption.verificationUrl = removeParam(["vtype", "vtoken"], raasoption.verificationUrl || encodeURIComponent(emailverifyurl));

    window.lr_raas_settings = window.lr_raas_settings || {};
    if (window.lr_raas_settings.registration) {
        //option.onSuccess = window.lr_raas_settings.registration.success;

        option.onSuccess = function (response, data) {
            if (!LRObject.util.federationCallbackHandler(response)) {
                window.lr_raas_settings.registration.success(response, data);
            }
        }
        option.onError = window.lr_raas_settings.registration.error;
        option.container = window.lr_raas_settings.registration.containerid;
        LRObject.init('registration', option);
    }

    if (window.lr_raas_settings.login) {
        option.onSuccess = function (response) {


            if (response.Profile && response.Profile.Uid) {
                LRObject.documentCookies.setItem('uid', response.Profile.Uid, '', '/');
            }
            if (!LRObject.util.federationCallbackHandler(response)) {
                window.lr_raas_settings.login.success(response);
            }

        };
        option.onError = window.lr_raas_settings.login.error;
        option.container = window.lr_raas_settings.login.containerid;
        LRObject.init('login', option);
    }

    if (window.lr_raas_settings.forgotpassword) {
        option.onSuccess = function (response, data) {
            if (!LRObject.util.federationCallbackHandler(response)) {
                window.lr_raas_settings.forgotpassword.success(response, data);
            }
        };
        option.onError = window.lr_raas_settings.forgotpassword.error;
        option.container = window.lr_raas_settings.forgotpassword.containerid;
        LRObject.init('forgotPassword', option);

    }

    if (window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=reset') > -1) {
        if (window.lr_raas_settings.resetpassword) {
            option.onSuccess = function (response, data) {
                if (!LRObject.util.federationCallbackHandler(response)) {
                    window.lr_raas_settings.resetpassword.success(response, data);
                }
            };
            option.onError = window.lr_raas_settings.resetpassword.error;
            option.container = window.lr_raas_settings.resetpassword.containerid;
            LRObject.init('resetPassword', option);
        }
    }

    if (window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=emailverification') > -1) {
        if (window.lr_raas_settings.emailverification) {
            option.onSuccess = function (response) {
                if (response.Profile && response.Profile.Uid) {
                    LRObject.documentCookies.setItem('uid', response.Profile.Uid, '', '/')
                }
                if (!LRObject.util.federationCallbackHandler(response)) {
                    window.lr_raas_settings.emailverification.success(response);
                }
            };
            option.onError = window.lr_raas_settings.emailverification.error;
            if (window.lr_raas_settings.emailverification.container) {
                option.container = window.lr_raas_settings.emailverification.container;
            }
            LRObject.init('verifyEmail', option);
        }
    }


    if (window.lr_raas_settings.instantlinklogin) {
        option.onSuccess = function (response) {
            //On Success
            if (response.Profile && response.Profile.Uid) {
                LRObject.documentCookies.setItem('uid', response.Profile.Uid, '', '/');
            }

            if (!LRObject.util.federationCallbackHandler(response)) {
                window.lr_raas_settings.instantlinklogin.success(response);
            }

        };
        option.onError = window.lr_raas_settings.instantlinklogin.error;

        LRObject.init("instantLinkLogin", option);
    }
    if (window.lr_raas_settings.sociallogin) {

        option.templateName = window.lr_raas_settings.sociallogin.templateid;
        LRObject.customInterface(window.lr_raas_settings.sociallogin.interfaceid, option);
        option.onError = window.lr_raas_settings.sociallogin.error;
        option.container = window.lr_raas_settings.sociallogin.containerid;
        option.onSuccess = function (response, userprofile) {
            if (response.IsPosted && !response.UUID) {
                window.lr_raas_settings.sociallogin.success(response);
            } else if(!response.UUID) {

                if (response.Profile && response.Profile.Uid) {
                    LRObject.documentCookies.setItem('uid', response.Profile.Uid, '', '/');
                }
                if (!LRObject.util.federationCallbackHandler(response)) {

                    window.lr_raas_settings.sociallogin.success(response);
                }
            }
        };

        LRObject.init('socialLogin', option);
    }
    if (window.lr_raas_settings.organization) {
        var organization_options = {};
        organization_options.onSuccess = function (response) {
            // Success
            window.lr_raas_settings.organization.success(response);
        }
        organization_options.onError = function (errors) {
            //On Errors
            window.lr_raas_settings.organization.error(errors);
        };
        organization_options.container = window.lr_raas_settings.organization.containerid;
        LRObject.init('organization', organization_options);
    }


})();
