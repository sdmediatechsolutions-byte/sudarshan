

(() => {

    'use strict';


    const CONFIG = Object.freeze({
  pixelId: '1436746085184734',
      telegramUrl: 'https://t.me/+PABpOM6kiA9iOGE1',
       pageViewDelayMs:
            3000,

        passiveReaderDelayMs:
            8000,

        minimumClickTimeMs:
            1000,

        trackedRedirectDelayMs:
            700,

        fastRedirectDelayMs:
            50,

        pageViewSessionKey:
            'ca_nitin_murarka_qualified_page_view'

    });



    const pageOpenedAt = Date.now();


    let pageViewTracked = false;

    let subscribeTracked = false;

    let navigationStarted = false;

    let humanInteractionDetected = false;



    /* ========================================================
       LOAD META PIXEL
    ======================================================== */

    function loadMetaPixel() {


        const pixelGuardKey =
            `__caNitinMurarkaPixelInitialized_${CONFIG.pixelId}`;



        !function(f, b, e, v, n, t, s) {


            if(f.fbq)
                return;


            n = f.fbq = function() {


                n.callMethod

                    ? n.callMethod.apply(
                        n,
                        arguments
                    )

                    : n.queue.push(
                        arguments
                    );

            };


            if(!f._fbq)
                f._fbq = n;


            n.push = n;

            n.loaded = true;

            n.version = '2.0';

            n.queue = [];


            t = b.createElement(e);

            t.async = true;

            t.src = v;


            s =
                b.getElementsByTagName(e)[0];


            s.parentNode.insertBefore(
                t,
                s
            );


        }(

            window,

            document,

            'script',

            'https://connect.facebook.net/en_US/fbevents.js'

        );



        /*
         * Prevent duplicate Pixel initialization.
         */

        if(window[pixelGuardKey])
            return;



        let pixelAlreadyRegistered = false;



        try {


            if(
                typeof fbq.getState ===
                'function'
            ) {


                const pixelState =
                    fbq.getState();


                pixelAlreadyRegistered =
                    pixelState.pixels.some(
                        (pixel) =>

                            String(pixel.id) ===
                            String(CONFIG.pixelId)

                    );

            }


        }

        catch(error) {


            pixelAlreadyRegistered = false;


        }



        if(!pixelAlreadyRegistered) {


            fbq(
                'init',
                CONFIG.pixelId
            );


        }



        window[pixelGuardKey] = true;

    }



    /* ========================================================
       SESSION PAGEVIEW CHECK
    ======================================================== */

    function sessionPageViewExists() {


        try {


            return (
                sessionStorage.getItem(
                    CONFIG.pageViewSessionKey
                ) === 'true'
            );


        }

        catch(error) {


            return false;


        }

    }



    function saveSessionPageView() {


        try {


            sessionStorage.setItem(

                CONFIG.pageViewSessionKey,

                'true'

            );


        }

        catch(error) {


            /*
             * Ignore browsers where sessionStorage
             * is unavailable.
             */


        }

    }



    /* ========================================================
       BASIC AUTOMATION CHECK
    ======================================================== */

    function automationDetected() {


        return (
            navigator.webdriver === true
        );


    }



    /* ========================================================
       QUALIFIED PAGEVIEW
    ======================================================== */

    function tryQualifiedPageView() {


        const timeOnPageMs =
            Date.now() - pageOpenedAt;



        /*
         * Qualification #1:
         *
         * Visitor interacted with page
         * and stayed at least 3 seconds.
         */

        const interactionQualified =

            humanInteractionDetected &&

            timeOnPageMs >=
                CONFIG.pageViewDelayMs;



        /*
         * Qualification #2:
         *
         * Visitor stayed focused on page
         * for at least 8 seconds.
         */

        const passiveReaderQualified =

            timeOnPageMs >=
                CONFIG.passiveReaderDelayMs;



        const canTrack =

            !pageViewTracked &&

            !sessionPageViewExists() &&

            !automationDetected() &&

            (
                interactionQualified ||
                passiveReaderQualified
            ) &&

            document.visibilityState ===
                'visible' &&

            document.hasFocus() &&

            typeof window.fbq ===
                'function';



        if(!canTrack)
            return;



        /*
         * Send qualified PageView
         */

        fbq(

            'track',

            'PageView',

            {

                qualified_view:
                    true,

                human_interaction:
                    humanInteractionDetected,

                qualification:

                    interactionQualified

                        ? 'interaction_3_seconds'

                        : 'focused_8_seconds',

                time_on_page:

                    Math.round(
                        timeOnPageMs / 1000
                    )

            }

        );



        pageViewTracked = true;


        saveSessionPageView();

    }



    /* ========================================================
       HUMAN INTERACTION
    ======================================================== */

    function recordHumanInteraction(event) {


        /*
         * isTrusted helps distinguish browser-generated
         * user interaction from manually dispatched
         * JavaScript events.
         */

        if(
            !event.isTrusted ||
            humanInteractionDetected
        ) {


            return;


        }



        humanInteractionDetected = true;



        tryQualifiedPageView();

    }



    function initializeVisitorQualification() {


        const interactionEvents = [

            'pointerdown',

            'touchstart',

            'keydown',

            'scroll',

            'mousemove'

        ];



        interactionEvents.forEach(
            (eventName) => {


                window.addEventListener(

                    eventName,

                    recordHumanInteraction,

                    {

                        passive: true,

                        once: true

                    }

                );


            }
        );



        /*
         * First qualification check
         */

        window.setTimeout(

            tryQualifiedPageView,

            CONFIG.pageViewDelayMs

        );



        /*
         * Passive reader qualification check
         */

        window.setTimeout(

            tryQualifiedPageView,

            CONFIG.passiveReaderDelayMs

        );

    }



    /* ========================================================
       TELEGRAM CTA + SUBSCRIBE EVENT
    ======================================================== */

    function handleTelegramClick(event) {


        event.preventDefault();



        /*
         * Prevent multiple clicks from firing
         * multiple redirects/events.
         */

        if(navigationStarted)
            return;



        navigationStarted = true;



        const timeOnPageMs =
            Date.now() - pageOpenedAt;



        /*
         * CTA qualifies when:
         *
         * - real browser click
         * - webdriver not detected
         * - visitor has spent at least 1 second
         */

        const isQualifiedClick =

            event.isTrusted &&

            !automationDetected() &&

            timeOnPageMs >=
                CONFIG.minimumClickTimeMs;



        /*
         * Fire Subscribe only once.
         */

        if(

            isQualifiedClick &&

            !subscribeTracked &&

            typeof window.fbq ===
                'function'

        ) {


            fbq(

                'track',

                'Subscribe',

                {

                    value:
                        0,

                    currency:
                        'INR',

                    destination:
                        'Telegram',

                    source:
                        'CA Nitin Murarka Landing Page',

                    time_on_page:

                        Math.round(
                            timeOnPageMs / 1000
                        )

                }

            );



            subscribeTracked = true;

        }



        /*
         * Give Meta Pixel a short window
         * to send the event before redirect.
         */

        const redirectDelay =

            isQualifiedClick

                ? CONFIG.trackedRedirectDelayMs

                : CONFIG.fastRedirectDelayMs;



        window.setTimeout(

            () => {


                window.location.assign(
                    CONFIG.telegramUrl
                );


            },

            redirectDelay

        );

    }



    /* ========================================================
       CONNECT ALL TELEGRAM BUTTONS
    ======================================================== */

    function initializeTelegramButtons() {


        const buttons =
            document.querySelectorAll(
                '.join-link'
            );



        buttons.forEach(
            (button) => {


                /*
                 * Force every CTA to use
                 * the configured Telegram URL.
                 */

                button.href =
                    CONFIG.telegramUrl;



                button.addEventListener(

                    'click',

                    handleTelegramClick

                );


            }
        );

    }



    /* ========================================================
       START
    ======================================================== */

    loadMetaPixel();


    initializeVisitorQualification();



    if(
        document.readyState ===
        'loading'
    ) {


        document.addEventListener(

            'DOMContentLoaded',

            initializeTelegramButtons,

            {
                once: true
            }

        );


    }

    else {


        initializeTelegramButtons();


    }


})();


