var _queryString = window.location.search.replace("?", "");

var successMessages = {
  Register:
    "A verification email has been sent to your provided email address, please check your email for further instructions",
  SocialLogin:
    "A verification email has been sent to your provided email address, please check your email for further instructions",
  PasswordReset: "Password was reset successfully",
  PasswordForgot:
  "A password reset link has been sent to your provided email address, please check your email for further instructions",
  EmailVerify: "Email verification complete, now you may log in",
  InstantLink:
    "Instant Link For Login has been sent to your provided email id, check email for further instruction",
  ResendOTP: "OTP has been sent to your provided phone number. ",
};

var lr_raas_settings = window.lr_raas_settings || {};

lr_raas_settings.registration = {};
lr_raas_settings.registration.containerid = "registration-container";
lr_raas_settings.registration.success = function (response) {
  if (_queryString.indexOf("action=register&account_setup=true") !== -1) {
    if (response.Profile) {
      $.ajax({
        url: window.location.href.replace("auth.aspx?action=register&account_setup=true", "ssologin/logout"),
        success: function() {
          window.close();
        },
        error: function() {
          window.close();
        }
      });
    }
    return;
  }

  lr_raas_settings.login.success(response, "register");
  //          if (response.access_token) {
  //            redirectToReturnUrl(response.access_token);
  //        }
  //        else {
  //        if (_queryString.indexOf('return_url') != -1) {
  //            registrationSuccess('register');
  //        } else {
  //            setMessage(successMessages.Register);
  //            resetForm('loginradius-registration');
  //        }
  //    }
};
lr_raas_settings.registration.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Message, true);
};

lr_raas_settings.login = {};
lr_raas_settings.login.containerid = "login-container";
lr_raas_settings.login.success = function (response, flag) {
  if (response.access_token) {
    redirectToReturnUrl(response.access_token);
  } else {
    if (
      response.AccountSid ||
      response.Sid ||
      (response.Data && (response.Data.AccountSid || response.Data.Sid))
    ) {
      setMessage(successMessages.ResendOTP);
    } else if (_queryString.indexOf("return_url") != -1) {
      registrationSuccess("register");
    } else {
      if (flag == "register") {
        setMessage(successMessages.Register);
        resetForm("loginradius-registration");
      } else if(raasoption.passwordlessLogin && response.IsPosted) {
        setMessage(successMessages.InstantLink);
        resetForm("loginradius-login");
      }
    }
  }
};
lr_raas_settings.login.error = function (errors) {
  if (errors[0].Data && errors[0].Data.LoginLockedTimeout) {
    const suspendTimeLeftSeconds = Math.round((new Date(errors[0].Data.LoginLockedTimeout).getTime() - new Date().getTime()) / 1000);
    let errorMessage = "Your account has been suspended. Please try after " + suspendTimeLeftSeconds + " seconds.";
    if (suspendTimeLeftSeconds > 0) {
      setMessage(errorMessage, true);
    } else {
      setMessage(errors[0].Description, true);
    }
  } else if (!errors[0].rule) setMessage(errors[0].Description, true);
};

lr_raas_settings.sociallogin = {};
lr_raas_settings.sociallogin.interfaceclass = ".interfacecontainerdiv";
lr_raas_settings.sociallogin.containerid = "sociallogin-container";
lr_raas_settings.sociallogin.interfaceid = "interfacecontainerdiv";
lr_raas_settings.sociallogin.templateid = "loginradiuscustom_tmpl";

lr_raas_settings.sociallogin.success = function (response, data) {
  if (response.IsPosted) {
    if (_queryString.indexOf("return_url") != -1) {
      registrationSuccess("register");
    } else {
      setMessage(successMessages.SocialLogin);
      resetForm("loginradius-registration");
      showLogin();
    }
  } else {
    redirectToReturnUrl(response.access_token);
  }
};
lr_raas_settings.sociallogin.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Message, true);
};

lr_raas_settings.instantlinklogin = {};
lr_raas_settings.instantlinklogin.success = function (response) {
  redirectToReturnUrl(response.access_token);
};
lr_raas_settings.instantlinklogin.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Message, true);
};

lr_raas_settings.resetpassword = {};
lr_raas_settings.resetpassword.containerid = "resetpassword-container";
lr_raas_settings.resetpassword.success = function (response) {
  setMessage(successMessages.PasswordReset);
  showLogin();
};
lr_raas_settings.resetpassword.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Description, true);
};
if (
  window.location.search.indexOf("vtoken") > -1 &&
  window.location.search.indexOf("vtype=reset") > -1
) {
  showResetPassword();
}

lr_raas_settings.forgotpassword = {};
lr_raas_settings.forgotpassword.containerid = "forgotpassword-container";
lr_raas_settings.forgotpassword.success = function (response) {
  if (
    response.IsPosted &&
    response.Data &&
    (response.Data.AccountSid || response.Data.Sid)
  ) {
    setMessage(successMessages.ResendOTP);
  } else if (_queryString.indexOf("return_url") != -1) {
    registrationSuccess("forgotpassword");
  } else {
    if (raasoption.phoneLogin && response.Data === null) {
      setMessage(successMessages.PasswordReset);
      showLogin();
    } else {
      setMessage(successMessages.PasswordForgot);
      resetForm("loginradius-forgotpassword");
    }
  }
};
lr_raas_settings.forgotpassword.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Message, true);
};

lr_raas_settings.emailverification = {};
lr_raas_settings.emailverification.success = function (response) {
  if (response.access_token) {
    redirectToReturnUrl(response.access_token);
  } else {
    setMessage(successMessages.EmailVerify);
  }
};
lr_raas_settings.emailverification.error = function (errors) {
  if (!errors[0].rule) setMessage(errors[0].Message, true);
};

raasoption.formValidationMessage = true;
//raasoption.instantLinkLogin = true;

var forgotpasswordurl = window.location.href
  .replace("action=forgotpassword&", "")
  .replace("action=login&", "");
var emailverifyurl = window.location.href.replace("action=register&", "");

raasoption.forgotPasswordUrl =
  raasoption.forgotPasswordUrl || encodeURIComponent(forgotpasswordurl);
raasoption.verificationUrl =
  raasoption.verificationUrl || encodeURIComponent(emailverifyurl);
//raasoption.callbackUrl= window.location;
//raasoption.templateName = window.lr_raas_settings.sociallogin.templateid;
raasoption.hashTemplate = true;
raasoption.callbackUrl = window.location.href.split("?")[0];
var customizeFormValue = false;
var LRObject = new LoginRadiusV2(raasoption);

LRObject.$hooks.register("afterFormRender", function (
  name,
  container,
  _classPrefix,
  form
) {
  $("input")
    .not(
      ":input[type=button], :input[type=submit], :input[type=reset],:input[type=checkbox]"
    )
    .parent()
    .addClass("input-field");
  $("input[type=checkbox]").parent().addClass("checkbox-field");
  $("input[type=checkbox]").addClass("filled-in");
  $("input[type='submit']").addClass("waves-effect waves-light btn light-blue");
  $("label").hide();
  var hash = ".";
  if ($("#" + container).length) {
    hash = "#";
  }
  $(hash + container + ' input[type="submit"]').each(function (i) {
    if ($(this).parent("div").length == 0) {
      var name = "action-class" + i;
      $(this).wrap('<div class="lr-action-button ' + name + '"></div>');
    }
  });

  if (name === "resetpassword" && container === "forgotpassword-container") {
    $(".content-loginradius-resendotp").addClass("lr-action-button action-class1");
    $("#loginradius-resetpassword-resendotp").get(0).type="submit";
    $("#loginradius-resetpassword-resendotp").addClass("loginradius-submit waves-effect waves-light btn light-blue");
    $("#loginradius-resetpassword-resendotp").click(function(event) {
      event.preventDefault();
    });
  }

  if (name === "login") {
    $("#login-container .action-class0").append(
      "<a class='lr-raas-forgot-password'  onclick='showForgotPassword()'>Forgot password?</a>"
    );
  }
  $(".action-class1").addClass("lr-link-box email-me-link");

  $("form :input").each(function (index, elem) {
    var eId = $(elem).attr("id");
    var label = null;
    if (
      eId &&
      (label = $(elem)
        .parents("form")
        .find("label[for=" + eId + "]")).length == 1
    ) {
      if ($(elem).is("select"))
        $(elem).prepend(
          "<option value disabled selected hidden>" +
            $(label).html() +
            "</option>"
        );
      else $(elem).attr("placeholder", $(label).html().replace("Email Id", "Email"));
      $(label).hide();
    }
  });
});
LRObject.$hooks.call("customizeFormPlaceholder", {
  confirmpassword: "Confirm Password",
  password: "Password",
  emailid: "Email"
});

LRObject.$hooks.call('mapErrorMessages',{
	code: 991,
	message: "User account is already registered and blocked",
	description: "User account is already registered and blocked"
});

LRObject.registrationFormSchema = raasoption.registrationFormSchema;
var queryString = LRObject.util.parseQueryString(
  window.location.search.replace("?", "")
);

// for (var i = 0; i < LRObject.registrationFormSchema.length; i++) {
//   if (LRObject.registrationFormSchema[i].name == "birthdate") {
//     showBirthdateDatePicker();
//   }
// }

LRObject.$hooks.register("startProcess", function () {
  visibleLoadingSpinner(true);
});
LRObject.$hooks.register("endProcess", function () {
  if (document.getElementById("interfacecontainerdiv").firstChild) {
    $("#social-block-label").show();
  }
  visibleLoadingSpinner(false);
});

LRObject.$hooks.register("socialLoginFormRender", function () {
  //on social login form render
  $(
    "#lr-traditional-login,#lr-raas-registartion,#resetpassword-container,#lr-social-login,#interfacecontainerdivn"
  ).hide();
  $("#lr-raas-sociallogin").show();
});

if (queryString.action === "register") {
  $(".lr-tabs a").removeClass("active");
  $(".lr-register-link").addClass("active");
  showRegister();
} else if (queryString.action === "login") {
  showLogin();
} else if (queryString.action === "forgotpassword") {
  showForgotPassword();
}

jQuery(".lr-raas-forgot-password").click(showForgotPassword);
jQuery(".lr-raas-login-link").click(showLogin);
jQuery(".lr-register-link").click(showRegister);

function showForgotPassword() {
  $(
    "#lr-traditional-login,#lr-raas-registartion,#resetpassword-container,#lr-social-login,#lr-raas-resetpassword,.lr-forms-items-header,.lr-tabs"
  ).hide();
  $("#lr-raas-forgotpassword").show();
}

function showLogin() {
  $(
    "#lr-social-login,#lr-traditional-login,.lr-tabs,.lr-forms-items-header"
  ).show();
  $(".custom-seprator").show();
  $(
    "#lr-raas-registartion,#lr-raas-forgotpassword,#resetpassword-container,#lr-raas-sociallogin,#lr-raas-resetpassword"
  ).hide();
}

function showRegister() {
  $(
    "#lr-traditional-login,#lr-raas-forgotpassword,#resetpassword-container,#lr-raas-sociallogin,#lr-raas-resetpassword"
  ).hide();
  $(
    "#lr-social-login,#lr-raas-registartion,.lr-tabs,.lr-forms-items-header"
  ).show();
  $(".custom-seprator").show();
}

function showResetPassword() {
  $(
    "#lr-traditional-login,#lr-raas-forgotpassword,.lr-forms-items-header,.lr-tabs,#lr-social-login,#lr-traditional-login"
  ).hide();
  $("#resetpassword-container,#lr-raas-resetpassword").show();
}

function setMessage(msg, isError) {
  if (isError) {
    jQuery("#lr-raas-message")
      .show()
      .removeClass("loginradius-raas-success-message")
      .addClass("loginradius-raas-error-message")
      .text(msg)
      .delay(10000)
      .fadeOut(300);
  } else {
    jQuery("#lr-raas-message")
      .show()
      .removeClass("loginradius-raas-error-message")
      .addClass("loginradius-raas-success-message")
      .text(msg)
      .delay(10000)
      .fadeOut(300);
  }

  visibleLoadingSpinner(false);
}

function redirectToReturnUrl(token) {
  if (queryString.return_url) {
    window.location =
      queryString.return_url.indexOf("?") > -1
        ? queryString.return_url + "&token=" + token
        : queryString.return_url + "?token=" + token;
  } else {
    window.location = "profile.aspx";
  }
}

function resetForm(formname) {
  clearForm(document.getElementsByName(formname)[0]);
}

function registrationSuccess(action) {
  window.location =
    queryString.return_url.indexOf("?") > -1
      ? queryString.return_url + "&action_completed=" + action
      : queryString.return_url + "?action_completed=" + action;
}

function visibleLoadingSpinner(isvisible) {
  if (isvisible) {
    $("#loading-spinner").show();
  } else {
    $("#loading-spinner").hide();
  }
}

function clearForm(myFormElement) {
  var elements = myFormElement.elements;

  myFormElement.reset();

  for (i = 0; i < elements.length; i++) {
    var field_type = elements[i].type.toLowerCase();

    switch (field_type) {
      case "text":
      case "password":
      case "textarea":
        elements[i].value = "";
        break;

      case "radio":
      case "checkbox":
        if (elements[i].checked) {
          elements[i].checked = false;
        }
        break;

      case "select-one":
      case "select-multi":
        elements[i].selectedIndex = -1;
        break;

      default:
        break;
    }
  }
}

// function showBirthdateDatePicker() {
//   var maxYear = new Date().getFullYear();
//   var minYear = maxYear - 100;
//   $("body").on("focus", ".loginradius-birthdate", function () {
//     $(".loginradius-birthdate").datepicker({
//       dateFormat: "mm-dd-yy",
//       maxDate: new Date(),
//       minDate: "-100y",
//       changeMonth: true,
//       changeYear: true,
//       yearRange: minYear + ":" + maxYear,
//     });
//   });
// }

function setOptions() {
  $("#logo-image").hide();

  if (typeof options !== "undefined") {
    if (options.logoUrl) {
      $("#lr-logo-svg").hide();
      $("#logo-image").show();
      $("#logo-image").attr("src", options.logoUrl);
    }
    else{
      // if($('#logo-image').attr('src')==='data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=')
      // $("#logo-image").attr("src", "data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='246' viewBox='0 0 1200 246'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: %23008ecf; %7D .cls-2 %7B fill: %23fff; %7D %3C/style%3E%3C/defs%3E%3Ctitle%3Eloginradius-logo--horizontal-full-colour-on-dark%3C/title%3E%3Cg id='horizontals'%3E%3Cg%3E%3Cg%3E%3Cpath class='cls-1' d='M126.9,1.18A125.9,125.9,0,0,0,82.29,244.82l10.64-29.64a94.43,94.43,0,1,1,67.93,0l10.64,29.64A125.9,125.9,0,0,0,126.9,1.18Z'/%3E%3Cpath class='cls-2' d='M103.57,185.54l10.65-29.67a31.47,31.47,0,1,1,25.36,0l10.65,29.67a63,63,0,1,0-46.66,0Z'/%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath class='cls-1' d='M739.19,95.72c1.57,0,3.38.09,5.42.29s4,.46,6,.79,3.78.66,5.43,1a33.88,33.88,0,0,1,3.64.88l-3.15,16a62.15,62.15,0,0,0-7.2-1.88,63.32,63.32,0,0,0-12.91-1.08,48.24,48.24,0,0,0-10.16,1.08c-3.35.73-5.56,1.22-6.61,1.48v86.18H701.33V102.22a125.18,125.18,0,0,1,16.17-4.43A103.81,103.81,0,0,1,739.19,95.72Z'/%3E%3Cpath class='cls-1' d='M803.49,95.32q11,0,18.63,2.86a30.21,30.21,0,0,1,12.23,8.09,30.61,30.61,0,0,1,6.6,12.42,60.2,60.2,0,0,1,2,15.88v64.08c-1.57.27-3.78.63-6.6,1.09s-6,.88-9.57,1.28-7.39.75-11.53,1.08-8.25.5-12.33.5a67.15,67.15,0,0,1-16-1.78,35.76,35.76,0,0,1-12.62-5.62A25.64,25.64,0,0,1,766,185.05a35.6,35.6,0,0,1-3-15.19,29.24,29.24,0,0,1,3.45-14.59,27.5,27.5,0,0,1,9.37-9.86,43.18,43.18,0,0,1,13.8-5.52,75.48,75.48,0,0,1,16.57-1.78,56.66,56.66,0,0,1,5.71.3q3,.3,5.62.79c1.78.33,3.32.62,4.64.89s2.23.46,2.76.59v-5.13a41.09,41.09,0,0,0-1-9,20.54,20.54,0,0,0-3.55-7.89,18,18,0,0,0-7-5.52,27.41,27.41,0,0,0-11.53-2.07A87.13,87.13,0,0,0,786,112.38,55.94,55.94,0,0,0,775.88,115l-2.17-15.18a56.9,56.9,0,0,1,11.83-3.06A101.79,101.79,0,0,1,803.49,95.32Zm1.57,91.9q6.51,0,11.54-.3a51.45,51.45,0,0,0,8.38-1.08V155.27a23.79,23.79,0,0,0-6.41-1.68,71.33,71.33,0,0,0-10.75-.69,68.41,68.41,0,0,0-8.77.6,26.86,26.86,0,0,0-8.48,2.46,18.22,18.22,0,0,0-6.41,5.13,13.45,13.45,0,0,0-2.56,8.57q0,9.87,6.31,13.71T805.06,187.22Z'/%3E%3Cpath class='cls-1' d='M929.17,45.37h18.34V200.43c-4.21,1.18-30.31,2.36-38.85,2.36a57.62,57.62,0,0,1-21.3-3.74,45.69,45.69,0,0,1-16.17-10.65,47,47,0,0,1-10.35-16.86,64.54,64.54,0,0,1-3.65-22.38,73,73,0,0,1,3.06-21.7,48.53,48.53,0,0,1,9-16.95,40.75,40.75,0,0,1,14.49-11.05,46.49,46.49,0,0,1,19.63-3.94A47.54,47.54,0,0,1,919,97.89a49.53,49.53,0,0,1,10.16,4.53Zm0,74.21a38,38,0,0,0-9.66-5.33,36.54,36.54,0,0,0-13.81-2.56,29.58,29.58,0,0,0-13.51,2.86,24.85,24.85,0,0,0-9.17,7.89,33.38,33.38,0,0,0-5.12,11.93,65.77,65.77,0,0,0-1.58,14.79q0,17.94,8.87,27.7c5.92,6.51,13.95,8.77,23.81,8.77,5,0,18.33-.65,20.17-1.17Z'/%3E%3Cpath class='cls-1' d='M1129.67,187.22q11.24,0,16.66-3t5.42-9.47a12.58,12.58,0,0,0-5.32-10.65q-5.33-3.93-17.55-8.87-5.91-2.37-11.34-4.83a39.44,39.44,0,0,1-9.37-5.82,25.4,25.4,0,0,1-6.31-8.08,26,26,0,0,1-2.36-11.64q0-13.61,10-21.59t27.41-8a78.92,78.92,0,0,1,8.68.49q4.33.5,8.09,1.19c2.49.46,4.7,1,6.6,1.48s3.39,1,4.44,1.38l-3.35,15.77a46.51,46.51,0,0,0-9.27-3.25A60.18,60.18,0,0,0,1137,110.7a28,28,0,0,0-13.4,3.06,10.12,10.12,0,0,0-5.72,9.56,13,13,0,0,0,1.28,5.92,13.74,13.74,0,0,0,3.94,4.64,32.46,32.46,0,0,0,6.61,3.84q3.94,1.77,9.46,3.75,7.3,2.76,13,5.42a40.62,40.62,0,0,1,9.76,6.21,24,24,0,0,1,6.21,8.58,31,31,0,0,1,2.17,12.32q0,14.2-10.55,21.5t-30.07,7.29q-13.61,0-21.3-2.26a109.28,109.28,0,0,1-10.45-3.46l3.35-15.77q3.15,1.19,10.06,3.55T1129.67,187.22Z'/%3E%3Cpath class='cls-1' d='M1083.07,200.43l-40.82,2.17a45.24,45.24,0,0,1-20.32-3.46,31.81,31.81,0,0,1-12.91-9.66,37.28,37.28,0,0,1-6.8-14.89,86,86,0,0,1-2-19.12V97.89h18.34v53.63a88,88,0,0,0,1.28,16.17,27.46,27.46,0,0,0,4.24,10.85,16.86,16.86,0,0,0,7.89,6c3.29,1.25,8.76.92,13.61.57,11.37-.82,14-1.15,19.13-1.52V97.89h18.34Z'/%3E%3Cg%3E%3Crect class='cls-1' x='964.71' y='97.88' width='18.34' height='102.54'/%3E%3Ccircle class='cls-1' cx='973.88' cy='57.2' r='11.83'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cpath class='cls-2' d='M548.46,97.89c-4.34-1.06-29.91-2.17-38.46-2.17a54.18,54.18,0,0,0-20.9,3.84,44.89,44.89,0,0,0-15.68,10.65,45.93,45.93,0,0,0-9.76,16.17A60.9,60.9,0,0,0,460.31,147c0,8.55,1.34,23,3.7,29.19a44.3,44.3,0,0,0,9.67,15.48A37.85,37.85,0,0,0,488,200.83a51,51,0,0,0,17.46,3,46.4,46.4,0,0,0,15.87-2.47,49.18,49.18,0,0,0,9.17-4v4.34q0,14.19-7.2,20.7t-23.56,6.51c-2.5,0-19.84,0-25.33-.12v15.87c5.38,0,22.41,0,24.93,0q24.85,0,37.07-10.65t12.23-34.32Zm-27.85,88.05A41.63,41.63,0,0,1,507.2,188a28.19,28.19,0,0,1-10.35-2,23.8,23.8,0,0,1-8.88-6.12,30.06,30.06,0,0,1-6.11-10.45c-1.51-4.2-2.42-16.37-2.42-22.29q0-16,8-25.63t22.77-9.66a89.19,89.19,0,0,1,12.52.69,59.68,59.68,0,0,1,7.4,1.48l.15,67.05A33,33,0,0,1,520.61,185.94Z'/%3E%3Cpath class='cls-2' d='M448.12,149.16a64.73,64.73,0,0,1-3.55,22.08,50.53,50.53,0,0,1-10,17,44,44,0,0,1-15.28,11,50.55,50.55,0,0,1-38.65,0,43.87,43.87,0,0,1-15.28-11,50.2,50.2,0,0,1-10-17,64.73,64.73,0,0,1-3.55-22.08,65,65,0,0,1,3.55-22,50.18,50.18,0,0,1,10-17.06,43.71,43.71,0,0,1,15.28-10.94,50.43,50.43,0,0,1,38.65,0,43.8,43.8,0,0,1,15.28,10.94,50.51,50.51,0,0,1,10,17.06A65,65,0,0,1,448.12,149.16Zm-19.13,0q0-17.35-7.79-27.51T400,111.49q-13.41,0-21.19,10.16T371,149.16q0,17.35,7.79,27.51T400,186.82q13.41,0,21.2-10.15T429,149.16Z'/%3E%3Cpath class='cls-2' d='M601.31,97.89l40.82-2.17a45.09,45.09,0,0,1,20.31,3.45,31.74,31.74,0,0,1,12.91,9.66,37.49,37.49,0,0,1,6.81,14.89,86.63,86.63,0,0,1,2,19.13v57.58H665.79V146.79a88,88,0,0,0-1.28-16.17,27.46,27.46,0,0,0-4.24-10.85,16.81,16.81,0,0,0-7.89-6c-3.29-1.25-7.6-.9-12.46-.65l-20.27,1v86.29H601.31Z'/%3E%3Cpath class='cls-2' d='M337.92,202.4c-.93-.54-22.59-13.71-22.59-32.46V45.37h18.34V169.94c0,11,15.18,20.38,15.32,20.5Z'/%3E%3Cg%3E%3Crect class='cls-2' x='565.77' y='97.89' width='18.34' height='102.54'/%3E%3Ccircle class='cls-2' cx='574.94' cy='57.2' r='11.83'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cpath class='cls-1' d='M1187.17,178.21a10.38,10.38,0,1,1-10.38,10.38,10.4,10.4,0,0,1,10.38-10.38m0-1.45A11.83,11.83,0,1,0,1199,188.59a11.82,11.82,0,0,0-11.83-11.83Z'/%3E%3Cpath class='cls-1' d='M1189.09,189.26c.19.24.43.54.71.92s.58.8.88,1.25.6.94.9,1.44a14.6,14.6,0,0,1,.76,1.45h-1.85c-.23-.44-.49-.89-.76-1.34s-.55-.89-.83-1.3-.55-.8-.82-1.16-.52-.67-.75-.94l-.46,0h-2v4.72h-1.69V182.41a9.94,9.94,0,0,1,1.59-.23c.59,0,1.13-.06,1.61-.06a6.67,6.67,0,0,1,3.88.95,3.31,3.31,0,0,1,1.34,2.86A3.37,3.37,0,0,1,1191,188,3.67,3.67,0,0,1,1189.09,189.26Zm-2.56-5.66c-.72,0-1.27,0-1.65.05v4.55h1.2a12.43,12.43,0,0,0,1.57-.09,3.28,3.28,0,0,0,1.18-.33,1.82,1.82,0,0,0,.74-.69,2.7,2.7,0,0,0,0-2.31,1.93,1.93,0,0,0-.71-.71,3,3,0,0,0-1-.37A7.39,7.39,0,0,0,1186.53,183.6Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
      $("#lr-logo-svg").show();
    }
    if (options.loginLabel || options.loginLabel === "") {
      $("#login-label").text(options.loginLabel);
    }
    if (options.signUpLabel || options.signUpLabel === "") {
      $("#sign-up-label").text(options.signUpLabel);
    }
    if (options.forgotPwLabel || options.forgotPwLabel === "") {
      $("#forgot-pw-label").text(options.forgotPwLabel);
    }
    if (options.forgotPwMessage || options.forgotPwMessage === "") {
      $("#forgot-pw-message").text(options.forgotPwMessage);
    }
    if (options.socialBlockLabel || options.socialBlockLabel === "") {
      $("#social-block-label").text(options.socialBlockLabel);
    }
    if (options.headingMessage || options.headingMessage === "") {
      $(".lr-forms-items-header h2").text(options.headingMessage);
    }
    if (options.paragraphMessage || options.paragraphMessage === "") {
      $(".lr-forms-items-header p").text(options.paragraphMessage);
    }

    // IDX phase 2 changes
    if (options.logoColor) {
      $("#logo-image").css("background-color", options.logoColor);
    }
    if (options.bodyBackgroundImage) {
      $(".bg").css(
        "background-image",
        "url(" + options.bodyBackgroundImage + ")"
      );
    }
    if (options.bodyBackgroundColor) {
      $(".lr-forms-container-inner").css(
        "background-color",
        options.bodyBackgroundColor
      );
      $(".lr-hostr-main-container").css(
        "background-color",
        options.bodyBackgroundColor
      );
    }
    if (options.bodyTextColor) {
      $(".lr-forms-items").find("*").css("color", options.bodyTextColor);
    }
    if (options.bodyFontFamily) {
      $(".lr-forms-items").find("*").css("font-family", options.bodyFontFamily);
    }
  }
  else{
    // if($('#logo-image').attr('src')==='data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=')
    // $("#logo-image").attr("src", "data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='246' viewBox='0 0 1200 246'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: %23008ecf; %7D .cls-2 %7B fill: %23fff; %7D %3C/style%3E%3C/defs%3E%3Ctitle%3Eloginradius-logo--horizontal-full-colour-on-dark%3C/title%3E%3Cg id='horizontals'%3E%3Cg%3E%3Cg%3E%3Cpath class='cls-1' d='M126.9,1.18A125.9,125.9,0,0,0,82.29,244.82l10.64-29.64a94.43,94.43,0,1,1,67.93,0l10.64,29.64A125.9,125.9,0,0,0,126.9,1.18Z'/%3E%3Cpath class='cls-2' d='M103.57,185.54l10.65-29.67a31.47,31.47,0,1,1,25.36,0l10.65,29.67a63,63,0,1,0-46.66,0Z'/%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath class='cls-1' d='M739.19,95.72c1.57,0,3.38.09,5.42.29s4,.46,6,.79,3.78.66,5.43,1a33.88,33.88,0,0,1,3.64.88l-3.15,16a62.15,62.15,0,0,0-7.2-1.88,63.32,63.32,0,0,0-12.91-1.08,48.24,48.24,0,0,0-10.16,1.08c-3.35.73-5.56,1.22-6.61,1.48v86.18H701.33V102.22a125.18,125.18,0,0,1,16.17-4.43A103.81,103.81,0,0,1,739.19,95.72Z'/%3E%3Cpath class='cls-1' d='M803.49,95.32q11,0,18.63,2.86a30.21,30.21,0,0,1,12.23,8.09,30.61,30.61,0,0,1,6.6,12.42,60.2,60.2,0,0,1,2,15.88v64.08c-1.57.27-3.78.63-6.6,1.09s-6,.88-9.57,1.28-7.39.75-11.53,1.08-8.25.5-12.33.5a67.15,67.15,0,0,1-16-1.78,35.76,35.76,0,0,1-12.62-5.62A25.64,25.64,0,0,1,766,185.05a35.6,35.6,0,0,1-3-15.19,29.24,29.24,0,0,1,3.45-14.59,27.5,27.5,0,0,1,9.37-9.86,43.18,43.18,0,0,1,13.8-5.52,75.48,75.48,0,0,1,16.57-1.78,56.66,56.66,0,0,1,5.71.3q3,.3,5.62.79c1.78.33,3.32.62,4.64.89s2.23.46,2.76.59v-5.13a41.09,41.09,0,0,0-1-9,20.54,20.54,0,0,0-3.55-7.89,18,18,0,0,0-7-5.52,27.41,27.41,0,0,0-11.53-2.07A87.13,87.13,0,0,0,786,112.38,55.94,55.94,0,0,0,775.88,115l-2.17-15.18a56.9,56.9,0,0,1,11.83-3.06A101.79,101.79,0,0,1,803.49,95.32Zm1.57,91.9q6.51,0,11.54-.3a51.45,51.45,0,0,0,8.38-1.08V155.27a23.79,23.79,0,0,0-6.41-1.68,71.33,71.33,0,0,0-10.75-.69,68.41,68.41,0,0,0-8.77.6,26.86,26.86,0,0,0-8.48,2.46,18.22,18.22,0,0,0-6.41,5.13,13.45,13.45,0,0,0-2.56,8.57q0,9.87,6.31,13.71T805.06,187.22Z'/%3E%3Cpath class='cls-1' d='M929.17,45.37h18.34V200.43c-4.21,1.18-30.31,2.36-38.85,2.36a57.62,57.62,0,0,1-21.3-3.74,45.69,45.69,0,0,1-16.17-10.65,47,47,0,0,1-10.35-16.86,64.54,64.54,0,0,1-3.65-22.38,73,73,0,0,1,3.06-21.7,48.53,48.53,0,0,1,9-16.95,40.75,40.75,0,0,1,14.49-11.05,46.49,46.49,0,0,1,19.63-3.94A47.54,47.54,0,0,1,919,97.89a49.53,49.53,0,0,1,10.16,4.53Zm0,74.21a38,38,0,0,0-9.66-5.33,36.54,36.54,0,0,0-13.81-2.56,29.58,29.58,0,0,0-13.51,2.86,24.85,24.85,0,0,0-9.17,7.89,33.38,33.38,0,0,0-5.12,11.93,65.77,65.77,0,0,0-1.58,14.79q0,17.94,8.87,27.7c5.92,6.51,13.95,8.77,23.81,8.77,5,0,18.33-.65,20.17-1.17Z'/%3E%3Cpath class='cls-1' d='M1129.67,187.22q11.24,0,16.66-3t5.42-9.47a12.58,12.58,0,0,0-5.32-10.65q-5.33-3.93-17.55-8.87-5.91-2.37-11.34-4.83a39.44,39.44,0,0,1-9.37-5.82,25.4,25.4,0,0,1-6.31-8.08,26,26,0,0,1-2.36-11.64q0-13.61,10-21.59t27.41-8a78.92,78.92,0,0,1,8.68.49q4.33.5,8.09,1.19c2.49.46,4.7,1,6.6,1.48s3.39,1,4.44,1.38l-3.35,15.77a46.51,46.51,0,0,0-9.27-3.25A60.18,60.18,0,0,0,1137,110.7a28,28,0,0,0-13.4,3.06,10.12,10.12,0,0,0-5.72,9.56,13,13,0,0,0,1.28,5.92,13.74,13.74,0,0,0,3.94,4.64,32.46,32.46,0,0,0,6.61,3.84q3.94,1.77,9.46,3.75,7.3,2.76,13,5.42a40.62,40.62,0,0,1,9.76,6.21,24,24,0,0,1,6.21,8.58,31,31,0,0,1,2.17,12.32q0,14.2-10.55,21.5t-30.07,7.29q-13.61,0-21.3-2.26a109.28,109.28,0,0,1-10.45-3.46l3.35-15.77q3.15,1.19,10.06,3.55T1129.67,187.22Z'/%3E%3Cpath class='cls-1' d='M1083.07,200.43l-40.82,2.17a45.24,45.24,0,0,1-20.32-3.46,31.81,31.81,0,0,1-12.91-9.66,37.28,37.28,0,0,1-6.8-14.89,86,86,0,0,1-2-19.12V97.89h18.34v53.63a88,88,0,0,0,1.28,16.17,27.46,27.46,0,0,0,4.24,10.85,16.86,16.86,0,0,0,7.89,6c3.29,1.25,8.76.92,13.61.57,11.37-.82,14-1.15,19.13-1.52V97.89h18.34Z'/%3E%3Cg%3E%3Crect class='cls-1' x='964.71' y='97.88' width='18.34' height='102.54'/%3E%3Ccircle class='cls-1' cx='973.88' cy='57.2' r='11.83'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cpath class='cls-2' d='M548.46,97.89c-4.34-1.06-29.91-2.17-38.46-2.17a54.18,54.18,0,0,0-20.9,3.84,44.89,44.89,0,0,0-15.68,10.65,45.93,45.93,0,0,0-9.76,16.17A60.9,60.9,0,0,0,460.31,147c0,8.55,1.34,23,3.7,29.19a44.3,44.3,0,0,0,9.67,15.48A37.85,37.85,0,0,0,488,200.83a51,51,0,0,0,17.46,3,46.4,46.4,0,0,0,15.87-2.47,49.18,49.18,0,0,0,9.17-4v4.34q0,14.19-7.2,20.7t-23.56,6.51c-2.5,0-19.84,0-25.33-.12v15.87c5.38,0,22.41,0,24.93,0q24.85,0,37.07-10.65t12.23-34.32Zm-27.85,88.05A41.63,41.63,0,0,1,507.2,188a28.19,28.19,0,0,1-10.35-2,23.8,23.8,0,0,1-8.88-6.12,30.06,30.06,0,0,1-6.11-10.45c-1.51-4.2-2.42-16.37-2.42-22.29q0-16,8-25.63t22.77-9.66a89.19,89.19,0,0,1,12.52.69,59.68,59.68,0,0,1,7.4,1.48l.15,67.05A33,33,0,0,1,520.61,185.94Z'/%3E%3Cpath class='cls-2' d='M448.12,149.16a64.73,64.73,0,0,1-3.55,22.08,50.53,50.53,0,0,1-10,17,44,44,0,0,1-15.28,11,50.55,50.55,0,0,1-38.65,0,43.87,43.87,0,0,1-15.28-11,50.2,50.2,0,0,1-10-17,64.73,64.73,0,0,1-3.55-22.08,65,65,0,0,1,3.55-22,50.18,50.18,0,0,1,10-17.06,43.71,43.71,0,0,1,15.28-10.94,50.43,50.43,0,0,1,38.65,0,43.8,43.8,0,0,1,15.28,10.94,50.51,50.51,0,0,1,10,17.06A65,65,0,0,1,448.12,149.16Zm-19.13,0q0-17.35-7.79-27.51T400,111.49q-13.41,0-21.19,10.16T371,149.16q0,17.35,7.79,27.51T400,186.82q13.41,0,21.2-10.15T429,149.16Z'/%3E%3Cpath class='cls-2' d='M601.31,97.89l40.82-2.17a45.09,45.09,0,0,1,20.31,3.45,31.74,31.74,0,0,1,12.91,9.66,37.49,37.49,0,0,1,6.81,14.89,86.63,86.63,0,0,1,2,19.13v57.58H665.79V146.79a88,88,0,0,0-1.28-16.17,27.46,27.46,0,0,0-4.24-10.85,16.81,16.81,0,0,0-7.89-6c-3.29-1.25-7.6-.9-12.46-.65l-20.27,1v86.29H601.31Z'/%3E%3Cpath class='cls-2' d='M337.92,202.4c-.93-.54-22.59-13.71-22.59-32.46V45.37h18.34V169.94c0,11,15.18,20.38,15.32,20.5Z'/%3E%3Cg%3E%3Crect class='cls-2' x='565.77' y='97.89' width='18.34' height='102.54'/%3E%3Ccircle class='cls-2' cx='574.94' cy='57.2' r='11.83'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cpath class='cls-1' d='M1187.17,178.21a10.38,10.38,0,1,1-10.38,10.38,10.4,10.4,0,0,1,10.38-10.38m0-1.45A11.83,11.83,0,1,0,1199,188.59a11.82,11.82,0,0,0-11.83-11.83Z'/%3E%3Cpath class='cls-1' d='M1189.09,189.26c.19.24.43.54.71.92s.58.8.88,1.25.6.94.9,1.44a14.6,14.6,0,0,1,.76,1.45h-1.85c-.23-.44-.49-.89-.76-1.34s-.55-.89-.83-1.3-.55-.8-.82-1.16-.52-.67-.75-.94l-.46,0h-2v4.72h-1.69V182.41a9.94,9.94,0,0,1,1.59-.23c.59,0,1.13-.06,1.61-.06a6.67,6.67,0,0,1,3.88.95,3.31,3.31,0,0,1,1.34,2.86A3.37,3.37,0,0,1,1191,188,3.67,3.67,0,0,1,1189.09,189.26Zm-2.56-5.66c-.72,0-1.27,0-1.65.05v4.55h1.2a12.43,12.43,0,0,0,1.57-.09,3.28,3.28,0,0,0,1.18-.33,1.82,1.82,0,0,0,.74-.69,2.7,2.7,0,0,0,0-2.31,1.93,1.93,0,0,0-.71-.71,3,3,0,0,0-1-.37A7.39,7.39,0,0,0,1186.53,183.6Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
    $("#lr-logo-svg").show();
  }

  if (!document.getElementById("interfacecontainerdiv").firstChild) {
    $("#social-block-label").hide();
  }
}

$(document).ready(function () {
  $(".lr-forms-items .lr-tabs a").click(function () {
    $(".lr-tabs a").removeClass("active");
    $(this).addClass("active");
  });
  $(".lr-raas-login-link").click(function () {
    $(".lr-tabs a").removeClass("active");
    $(".lr-raas-login-link").addClass("active");
  });
  $(".lr-register-link").click(function () {
    $(".lr-tabs a").removeClass("active");
    $(".lr-register-link").addClass("active");
  });
  setOptions();
});
LoginRadiusDefaults.buttonNames.passwordlessloginbuttonlabel =
  "Email me a link to Login";
LoginRadiusDefaults.buttonNames.passwordlessloginotpbuttonlabel =
  "Send an OTP to Login";
LRObject.$hooks.register("beforeFormRender", function (name, form) {
  if (name == "login") {
    LRObject.formPlaceholder = {
      emailid: "Enter Your Work Email ",
      password: "Enter Your Password",
    };
  }
});
