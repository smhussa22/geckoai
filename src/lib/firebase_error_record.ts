export const firebase_error_record: Record <string, { message: string, fix: string }> = {

    "auth/popup-closed-by-user": {

        message: "You closed the sign-in popup.",
        fix: "Please click the log in button to sign in. If issues persist, contact geckoaihelp@gmail.com for support."

    },

    "auth/cancelled-popup-request": {

        message: "Multiple sign-in attempts detected.",
        fix: "Please wait for the popup in order to log in. If issues persist, contact geckoaihelp@gmail.com for support."

    },

    "auth/popup-blocked": {

        message: "Your browser blocked the sign-in popup.",
        fix: "Please enable pop-ups for this website through your browser settings. If issues persist, contact geckoaihelp@gmail.com for support."

    },

    "auth/network-request-failed": {

        message: "Your internet connection is unable to support the request.",
        fix: "Please adjust your internet connection & try again. If issues persist, contact geckoaihelp@gmail.com for support. "

    },

    "auth/user-disabled": {

        message: "Your account has been disabled.",
        fix: "Please contact geckoaihelp@gmail.com for support."

    }

}