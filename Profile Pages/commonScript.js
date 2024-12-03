LRObject.LoginRadiusHostedPage = 'profile';
var sessionToken = LRObject.documentCookies.getItem('lr-session-token');
var showProfilePage = false;
if (sessionToken) {
    sessionToken = sessionToken.replace(/^"(.+)"$/, '$1');
    var sl_data = {}
    sl_data.token = sessionToken;
    var requiredfield_options = {};
    requiredfield_options.onSuccess = function(data) {
        showProfilePage = true;
    };
    requiredfield_options.onError = function(data) {
        showProfilePage = false;
        window.location = 'auth.aspx';
    }
    LRObject.$hooks.register('beforeFormRender', function(name, schema) {
        if (name == 'socialRegistration' && schema.length > 0) {
            window.location = 'auth.aspx';
        }
    });
    LRObject.setHostedToken = true;
    var callback = function() {
        LRObject.$hooks.register('registrationSchemaFilter', function (schema, profile) {
            var requiredFieldInSchema = false;
            for (var i = 0; i < schema.length; i++) {
                if (schema[i] && schema[i].rules && schema[i].rules.indexOf("required") > -1) {
                    requiredFieldInSchema = true;
                    break;
                }
            }
            if (profile && profile.RegistrationProvider == 'Email' && !(LRObject.options.askRequiredFieldForTraditionalLogin && requiredFieldInSchema)) {
                LRObject.registrationFormSchema = [];
            }
        })
    };
    LRObject.getAppConfiguration(callback)
    LRObject.api.socialLogin(sl_data, requiredfield_options.onSuccess, requiredfield_options.onError, '', raasoption.registartionSchema, 'sociallogin-container');
} else {
    showProfilePage = false;
}
if (window.lr_raas_settings && window.lr_raas_settings.accountLinking) {
    var option = {};
    option.onSuccess = function(response, data) {
        if (response.IsPosted) {
            window.lr_raas_settings.accountLinking.success();
            window.setTimeout(function() {
                window.location = window.location.pathname
            }, 2000);
        } else {
            linkAccount(data.Provider, data.ID);
        }
    };
    option.onError = window.lr_raas_settings.accountLinking.error;
    option.container = window.lr_raas_settings.accountLinking.containerid;
    option.templateName = window.lr_raas_settings.accountLinking.templateName;
    LRObject.init('linkAccount', option);
}
if (window.lr_raas_settings && window.lr_raas_settings.accountUnlinking) {
    var unlink_options = {};
    unlink_options.onSuccess = function(response) {
        if (response) {
            window.lr_raas_settings.accountUnlinking.success(response);
            window.setTimeout(function() {
                window.location = window.location.pathname
            }, 2000);
        }
    };
    unlink_options.onError = function(response) {
        if (response) {
            window.lr_raas_settings.accountUnlinking.error(response);
            window.setTimeout(function() {
                window.location = window.location.pathname
            }, 2000);
        }
    }
    LRObject.init("unLinkAccount", unlink_options);
}
if (window.lr_raas_settings && window.lr_raas_settings.profileEditor) {
    option.onSuccess = window.lr_raas_settings.profileEditor.success;
    option.onError = window.lr_raas_settings.profileEditor.error;
    option.container = window.lr_raas_settings.profileEditor.containerid;
    LRObject.init('profileEditor', option);
}
if (window.lr_raas_settings && window.lr_raas_settings.changePassword) {
    option.onSuccess = function() {
        if (typeof window.lr_raas_settings.changePassword.success == 'function') {
            window.lr_raas_settings.changePassword.success();
        } else {
            window.lr_raas_settings.changePassword.succes();
        }
    };
    option.onError = window.lr_raas_settings.changePassword.error;
    option.container = window.lr_raas_settings.changePassword.containerid;
    LRObject.init('changePassword', option);
}
if (window.lr_raas_settings && window.lr_raas_settings.deleteUserConfirm) {
    if (window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=deleteuser') > -1) {
        option.onSuccess = function(response) {
            if (response.IsPosted) {
                window.lr_raas_settings.deleteUserConfirm.success(response);
            }
        };
        option.onError = window.lr_raas_settings.deleteUserConfirm.error;
        LRObject.init('deleteUserConfirm', option);
    }
}
function deleteAccount() {
    option.onSuccess = function(response) {
        if (response.IsDeleteRequestAccepted) {
            window.lr_raas_settings.deleteUser.success(response);
        }
    };
    option.onError = window.lr_raas_settings.deleteUser.error;
    LRObject.init('deleteUser', option);
}
function unLinkAccount(provider, providerId) {
    buildAndSubmitForm({
        formaction: 'unlink',
        provider: provider,
        token: LRObject.documentCookies.getItem('lr-session-token'),
        providerId: providerId
    });
}
function linkAccount(provider, providerId) {
    buildAndSubmitForm({
        formaction: 'link',
        provider: provider,
        token: LRObject.documentCookies.getItem('lr-session-token'),
        providerId: providerId
    });
}
function injectAndsubmitForm(inputform, formData, action, method) {
    var form = inputform.clone(true, true);
    var $originalSelects = inputform.find('select');
    form.find('select').each(function(index, item) {
        $(item).val($originalSelects.eq(index).val());
    });
    action = action || "";
    method = method || "POST";
    for (var key in formData) {
        form.append($("<input type='hidden'>").attr("name", key).attr("value", formData[key]));
    }
    $("body").append(form);
    form.attr("action", action);
    form.attr("method", method);
    form.submit();
}
function buildAndSubmitForm(formData, action, method) {
    action = action || "";
    method = method || "POST";
    var form = $("<form>");
    form.attr("action", action);
    form.attr("method", method);
    for (var key in formData) {
        form.append($("<input type='hidden'>").attr("name", key).attr("value", formData[key]));
    }
    $("body").append(form);
    form.submit();
}
