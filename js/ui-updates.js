    var anime = require('animejs');
    var introJs = require('intro.js');

    //==========================================================
    // Jared's ui js 2018:
    (function(){

    // All getElement  variables:     
        // Send to document button
        var sendTo = document.getElementById('sendToDoc');
        // Terms and conditions checkbox
        var termsInput = document.getElementById('docuTermsConditions');
        // Terms and conditions modal close button
        var termsModalBtn  = document.getElementById('docusignAccept');
        // Enable simple sign slide toggle
        var signToggle = document.getElementById('signToggle');

        //Alerts button for alerts page
        var alert = document.getElementById('showAlert');

        // Alert Button for timer demo
        var alertTimer = document.getElementById('alertTimer');

        // Timing variable used in setTimeout, needs to be in a high scope above the toaster method      
        var timing;

        // Object for all ui upgrades
        var uiMods = {

            // Init for event listeners and other initializations
            init: function(){

                if (sendTo) {
                    sendTo.addEventListener('click', uiMods.termsCheck, false);    
                }

                if (termsInput) {
                    termsInput.addEventListener('click', uiMods.termsInputCheck, false);
                }
                
                if (termsModalBtn) {
                    termsModalBtn.addEventListener('click', uiMods.termsClose, false);    
                }
                
                if (signToggle) {
                    signToggle.addEventListener('click', uiMods.enableSignToggle, false);    
                }

                // Toaster click event
                if (alert) {
                    alert.addEventListener('click', function(e){
                        uiMods.toaster(e, {text: 'This is a nominal huge crazy alert', timer: false, color: 'dark'});
                    }, false);
                }

                // Toaster timer click event
                if (alertTimer) {
                    alertTimer.addEventListener('click', function(e){
                        uiMods.toaster(e, {text: 'This is an alert with a TIMER', timer: true, speed: 3000, color: 'light'});
                    }, false);
                }
                
                // tooltips and  popover initialization
                $('[data-toggle="popover"]').popover();
                $('[data-toggle="tooltip"]').tooltip();

                openJsCode();
            },

            // Launch and control terms and conditions ui on docusign panel
            termsCheck: function(){
                // console.log($('#termsHolder'));
                if (!termsInput.checked) {
                    uiMods.termsModal();
                    $('#termsHolder').addClass('notify');
                } else {
                    $('#termsHolder').removeClass('notify');
                }
            },

            // Launch and control terms and conditions ui on docusign panel for terms checkbox interaction
            termsInputCheck: function(){
                // Logic switch for terms checkbox click - modal display
                if (termsInput.checked) {
                    uiMods.termsModal();
                    $('#termsHolder').removeClass('notify');
                } else {
                    $('#termsHolder').addClass('notify');
                    
                }
            },

            // Show Simple Sign Terms & Conditions Modal
            termsModal: function(){
                $('#simpleSignTerms').modal('show');
            },

            // When modal acceptance button is clicked
            termsClose: function(){
                $('#termsHolder').removeClass('notify');
                $('#simpleSignTerms').modal('hide');
                termsInput.checked = true;
            },

            // Enable simple sign and full sign slider
            enableSignToggle: function(){
                // Simple Sign SLIDE toggle ui check variable
                var simpleSign = signToggle.childNodes[1].classList.contains('off');

                // Logic switch enable simple or full sign slider
                if (simpleSign) {
                    $('#simpleSignTerms').modal('show');
                    termsInput.checked = true;
                }

                // Logic switch for terms NORMAL checkbox click - modal display
                // if (!termsInput.checked && simpleSign) {
                //     $('#simpleSignTerms').modal('show');
                //     termsInput.checked = true;
                // }

            },

            //(e, {text: 'This is an alert with a TIMER', timer: true, speed: 6500, color: 'dark'})
            toaster: function(e, params) {

                // Set defaults for params.object options
                var setDefaults = function () {
                    if (e == null) {
                        e = this.event;
                    }
                    if (params.speed == null) {
                        params.speed = 3500;
                    }
                    if (params.timer == null) {
                        params.timer = false;
                    }
                    if (params.color == null) {
                        params.color = 'light';
                    }
                    if (params.text == null) {
                        params.text = 'This is a default warning';
                    }
                }();

                var close, el, mainToaster;

                var createDivSetVars = function (callback) {
                    // Check if old toaster exists then remove it
                    if (document.contains(document.getElementById('mainToaster'))) {
                        document.getElementById('mainToaster').remove();
                    }

                    // Create new toaster add to inside of body tag
                    document.body.insertAdjacentHTML( 'afterbegin', createToasterHtml());

                    // Close Button
                    close = document.getElementsByClassName('close-toaster');
                    // Toaster Elements
                    el = document.getElementsByClassName('toaster');
                    // ID Toaster Grab
                    mainToaster = document.getElementById('mainToaster');

                    setTimeout(function(){
                        callback();
                    }, 5);    

                }(checkTimerAndTransition);

                function checkTimerAndTransition () {

                    setTimeout(function(){
                        for (var i = 0; i < el.length; i++) {
                            // Opacity used for browser repaint
                            // to allow css transition on dynamically created 
                            // js property
                            el[i].style.opacity = 1;
                            el[i].className += ' show-toaster';
                        }
                    }, 5);

                    // Check if timer is needed or needs to be cleared
                    timerOn();
                }

                function createToasterHtml () {
                    var toasterDiv = 
                    '<div class="alert alert-warning notify toaster" id="mainToaster">   '+
                    '    <i class="fa fa-exclamation-circle"></i><p>Digital signing in progress!</p>'+
                    '    <span class="close-toaster"></span>'+
                    '  </div>';
                    return toasterDiv;
                }

                // Add text to the toaster
                var assignText = function () {
                 var para = el[0].childNodes[2];
                 para.textContent = params.text;
                }();

                // Color selector for alert div
                var colorSelect = function () {
                    var alertDiv = el[0].classList;
                    if (params.color === 'dark') {
                        alertDiv.remove('alert-warning');
                        alertDiv.add('alert-warning-b');
                    } else {
                        alertDiv.remove('alert-warning-b');
                        alertDiv.add('alert-warning');
                    }
                }();

                // stopEventChain is a function that sets up the 
                // second window listener for on and off toaster clicks
                // If user clicks off the toaster div/area anywhere on the window
                // the toaster will be removed. 
                var stopEventChain = function () {
                    e.stopImmediatePropagation();
                    this.removeEventListener('click', uiMods.toaster);
                    window.onclick = offToasterClickEvent;                    
                }();

                // Global onclick to remove toaster
                function offToasterClickEvent (evt) {
                    if (evt.target.classList.contains('toaster')) {
                    } else {
                        el[0].classList.remove('show-toaster');
                    }
                }

                function timeSet(){
                    timing = setTimeout(function(){
                        el[0].classList.remove('show-toaster');

                        console.log('removed');
                    }, params.speed);
                }

                function timerOn () {
                    clearTimeout(timing);
                    if (params.timer) {
                        console.log('setting');
                        timeSet();
                        console.log(timing);
                    } else {
                        console.log(timing);
                        console.log('clearTimeout before');
                        clearTimeout(timing);
                        console.log('clearTimeout after');
                    }
                } // timerOn ends

                // Click Event for close toaster with timeout
                for (var j = 0; j < close.length; j++) {
                    close[j].addEventListener('click', function(e){
                        e.path[1].classList.remove('show-toaster');
                    }, false);
                }

            } // toaster ends

        }; // uiMods object ends

        setTimeout(function() {
         uiMods.init();
        }, 1);


        // ***** New menu UI code 16-08-2018
        function newMenuUiWitToolTip () {
            // Click event for toggling new css class for menu
            $('#uiTrigger').click(function(){
                $('.nav-column, .main-panel').toggleClass('menu-off');
                $('#uiTrigger').tooltip('destroy'); 
            });

            // tootip functions for menu - hides after 5 seconds
            function tooltip () {
                $('#uiTrigger').tooltip({template: '<div class="tooltip menu-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'});
                $('#uiTrigger').tooltip('show');

                // uiTrigger tooltip timeout and remove
                setTimeout(function(){ $('#uiTrigger').tooltip('destroy'); }, 16000);

            }  
            tooltip();
            
        } // newMenuUiWitToolTip ENDS ***



        // Open js code function
        function openJsCode () {
            // call
            newMenuUiWitToolTip();

            // Authorisation Animation for show hide property listing divs
            $('#showPropsList, #hidePropPanel').click(function(){
                var holder = document.getElementById('propListingHolder')
                if (holder.classList.contains('off')) {
                    $('#propListingHolder').removeClass('off');
                    var slideOn = anime({
                      targets: '.property-listings-holder',
                      left: '0em',
                      duration: 500,
                      easing: 'easeOutExpo'
                    });
                } else {
                    $('#propListingHolder').addClass('off');
                    var slideOff = anime({
                      targets: '.property-listings-holder',
                      left: '-100em',
                      duration: 500,
                      easing: [0.91, -0.3, 0.29, 1.56]
                    });
                }
            }); // ***Property listing hide show ends

            $('#declineForm').click(function(){
                $('#formDeclineModal').modal('show');
            });

            window.onload = function () {
                if(!localStorage.getItem("eformPropertySearch")){

                   var intro = introJs();
                   intro.start();
                   localStorage.setItem("eformPropertySearch",true);
                }
            }

            window.onclick = windowCollapseUiFix;

            function windowCollapseUiFix () {
                var panelTester = document.getElementById('toggleSidePanel');
                console.log(toggleSidePanel)
            };


        } // ***openJscode ENDS


        
    })(); // iife ends
    //==========================================================
    // Jared's ui js 2018 ***Ends.