ReaderControl.config.customStyle = ['/css/custom.min.css', '/css/tron.min.css'];
var CustomColor = window.ControlUtils.getCustomData();

$(document).on('viewerLoaded', function () {
    var docViewer = readerControl.docViewer;
    var annotManager = docViewer.getAnnotationManager();

    // Logic switch for sig ui
    var logic = true;

    var toolbar = $('#control');
    var leftAlignedContainer = toolbar.find('.left-aligned');
    var rightAlignedContainer = toolbar.find('.right-aligned');

    // move page navigation to the right side of toolbar
    var pageNavContainer = $('#prevPage').parent();
    leftAlignedContainer.prepend(pageNavContainer);
    pageNavContainer.css('float', 'right');

    // move layout modes hover button to right side of toolbar
    var layoutModesContainer = $('#layoutModeDropDown').parent();
    leftAlignedContainer.prepend(layoutModesContainer);
    layoutModesContainer.css('float', 'right');

    // move zoom buttons to right side of toolbar
    // hide the zoom slider and textbox indicating the zoom percentage
    var zoomContainer = $('#zoomOut').parent();
    zoomContainer.find('#slider, #zoomBox').hide();
    leftAlignedContainer.prepend(zoomContainer);
    zoomContainer.css('float', 'right');

    // add custom fit mode toggle button
    var fitModesButton = $('<span class="glyphicons customicons arrow_nsew" data-i18n="[title]controlBar.fitPage"></span>').css('float', 'right');
    // toggle fit modes when clicking the button
    fitModesButton.on('click', function () {
        if (docViewer.getFitMode() === docViewer.FitMode.FitPage) {
            docViewer.setFitMode(docViewer.FitMode.FitWidth);
        } else {
            docViewer.setFitMode(docViewer.FitMode.FitPage);
        }
    });
    // update display of the button when the fit mode changes
    docViewer.on('fitModeUpdated', function (e, fitMode) {
        if (fitMode === docViewer.FitMode.FitPage) {
            fitModesButton.removeClass('arrow_nsew').addClass('arrow_ew');
        } else {
            fitModesButton.removeClass('arrow_ew').addClass('arrow_nsew');
        }
    });

    leftAlignedContainer.prepend(fitModesButton);

    // add strikethrough button to main panel
    function panelUpdates () {

        // hide default fitmodes button
        $('#fitModes').parent().hide();

        //hide the print  button
        $('#printButton').hide();

        // hide fullscreen button
        $('#fullScreenButton').hide();

        // add highlight and strikethrough option
        var rightAlignedElements = $('#toolList');
        var buttonA = $('<span>').attr({
            'id': 'strikethrough',
            'class': 'annotTool glyphicons text_strike',
            'data-i18n': '[title]annotations.tooltips.strikeout',
            'data-toolmode': 'AnnotationCreateTextStrikeout'
        });
        // console.log(rightAlignedElements);
        rightAlignedElements.prepend(buttonA);

        // Move textbox
        function createTextToolListPanel(){ 
            // Grab toolList and re-append within the dom
            // Note that initial sign exists within the dom
            // but is hidden by css
            var parent = document.getElementById('initialSign').parentNode;
            var sign = document.getElementById('initialSign'); 
            var item = document.getElementById('toolList');
            parent.insertBefore(item, sign); 

            // Move freText to the top of ToolList dom heirarchy
            $( '#freeText' ).prependTo( $( '#toolList' ) );
                    
        }

        createTextToolListPanel();


        // Update attributes of icon elements
        $('#strikethrough').attr({
            'title': 'Strikethrough text'
        });

        $('#freeText').attr({
            'class': 'glyphicons customicons text_resize'
        });

        $('#initialSign').attr({
            'class': 'glyphicons customicons pen'
        });

        $('#toggleNotesPanel').attr({
            'class': 'glyphicons list'
        });

    } // panelUpdates ENDS

    //Update signature dialogue when it is called with custom info, design and ui
    function updateSignatureUi () {

        if (logic) {
            var sigBox = $('#signatureDialog');
            var div = $('<div></div>');
            var p1 = $('<p></p>');
            var p2 = $('<p></p>');
            var span = $('<span></span>');
            div.attr({
                'class': 'sig-msg-holder'
            });
            p1.attr({
                'class': 'sig-msg'
            });
            p1.text('Your initial will be placed next to changes made during the negotiation process. Final Sign Off will be completed by all parties through Docusign once any negotiation is completed.');
            p2.attr({
                'class': 'sig-msg'
            });
            span.attr({
                'class': 'glyphicons flag'
            });
            sigBox.prepend(div);
            div.prepend(p2);
            div.prepend(p1);
            div.prepend(span);
            logic = false;
        };

        //Update text of signature button
        $('#signatureAddButton')["0"].innerText = 'Accept Initial';

    } //updateSignature ui ENDS



    var annotToolGroup = $('<div class="group"></div>');

    // make signature UI appear on click
    var signatureButton = $('<span id="initialSign" class="glyphicons customicons signature"></span>');
    signatureButton.on('click', function () {
        showSignatureDialog();
        updateSignatureUi();

    });

    annotToolGroup.append(signatureButton);

    // customize signature UI buttons
    $('#makeDefaultSignature').hide();
    $('#makeDefaultSignatureText').hide();

    var currentSignature;

    $('#signatureAddButton').off().on('click', function () {
        var signatureTool = readerControl.toolModeMap['AnnotationCreateSignature'];
        signatureTool.one('annotationAdded', function (e, signature) {
            currentSignature = signature;
            annotManager.deleteAnnotation(signature);
        });
        signatureTool.addSignature();

        alert("Thank you, your signature will be added to the end of your strikeout next time.");
        $('#signatureDialog').dialog('close');
    });

    // add signature beside created annotations
    annotManager.on('annotationChanged', function (e, annotations, action) {
        if (!e.imported && action === 'add') {
            if (currentSignature) {
                annotations.forEach(function (annot) {
                    if (annot.Subject !== 'Signature') {
                        var signature = annotManager.getAnnotationCopy(currentSignature);
                        signature.PageNumber = annot.PageNumber;
                        var x = annot.X + annot.Width;
                        var y = annot.Y;
                        var signatureRect = new Annotations.Rect(x, y, x + 15, y + 15);
                        signature.resize(signatureRect);
                        annotManager.addAnnotation(signature);
                        annotManager.redrawAnnotation(signature);
                    }
                });
            }
            else {
                showSignatureDialog();
            }
        }
    });

    // add annotation tool buttons
    var createToolButton = function (iconClass, tooltip, toolname) {
        var toolButton = $('<span class="glyphicons ' + iconClass + '" data-i18n="[title]' + tooltip + '"></span>');
        toolButton.on('click', function () {
            if (readerControl.getToolMode() === toolname) {
                readerControl.setToolMode('AnnotationEdit');
            } else {
                readerControl.setToolMode(toolname);
            }
        });
        annotToolGroup.append(toolButton);
        return toolButton;
    };

    var freeTextButton = createToolButton('customicons text_ibeam', 'Free Text', 'freetext', 'AnnotationCreateFreeText');
    var highlightButton = createToolButton('customicons text_highlight', 'annotations.tooltips.higlight', 'AnnotationCreateTextHighlight');
    var freeHandButton = createToolButton('brush', 'annotations.tooltips.freehand', 'AnnotationCreateFreeHand');
    var noteButton = createToolButton('comments', 'annotations.tooltips.stickyNote', 'AnnotationCreateSticky');

    // display annotation tools are active when they are the current tool
    docViewer.on('toolModeUpdated', function (e, tool) {
        annotToolGroup.children().removeClass('active');

        if (tool === readerControl.toolModeMap['AnnotationCreateFreeText']) {
            freeTextButton.addClass('active');
        } else if (tool === readerControl.toolModeMap['AnnotationCreateTextHighlight']) {
            highlightButton.addClass('active');
        } else if (tool === readerControl.toolModeMap['AnnotationCreateFreeHand']) {
            freeHandButton.addClass('active');
        } else if (tool === readerControl.toolModeMap['AnnotationCreateSticky']) {
            noteButton.addClass('active');
        }
    });
    rightAlignedContainer.prepend(annotToolGroup);
    panelUpdates();

    docViewer.on('annotationsLoaded', function() {
        var annotManager = readerControl.docViewer.getAnnotationManager();
        var userAnnots = annotManager.getAnnotationsList().filter(function (annot) {
            return !annot.Author;
        });

        userAnnots.forEach(function (annot) {
            annot.Listable = false;
        });

        window.noteManager.removeNotes(userAnnots, true);
    });


});


$(document).on('documentLoaded', function () {
    console.log('a');
    $('#initialSign').trigger('click');
    console.log($('#initialSign'));
    console.log('b');

    var docViewer = readerControl.docViewer;
    var annotManager = docViewer.getAnnotationManager();
    //hide the buttons
    $('#copyButton').hide();
    $('#selectUnderlineButton').hide();
    $('#selectSquigglyButton').hide();

    $('#downloadButton').parent().off().on('click', function () {
        var options = {
            xfdfString: docViewer.getAnnotationManager().exportAnnotations()
        };
        var doc = docViewer.getDocument();
        doc.getFileData(options).then(function (data) {
            var arr = new Uint8Array(data);
            var blob = new Blob([arr], {
                type: 'application/pdf'
            });
            // upload blob here
            saveBlob(blob);
        });
    });
  
    // set the strikeout stroke color+
    var strikeoutTool = readerControl.toolModeMap['AnnotationCreateTextStrikeout'];
    var freeHandTool = readerControl.toolModeMap['AnnotationCreateFreeHand'];
    var freeTextTool = readerControl.toolModeMap['AnnotationCreateFreeText'];

    if (CustomColor.toLowerCase() == "green") {
        strikeoutTool.defaults.StrokeColor = new Annotations.Color(0, 255, 0, 1);
        freeHandTool.defaults.StrokeColor = new Annotations.Color(0, 255, 0, 1);
        freeTextTool.defaults.TextColor = new Annotations.Color(0, 255, 0, 1);
    }
    else if (CustomColor.toLowerCase() == "blue") {
        strikeoutTool.defaults.StrokeColor = new Annotations.Color(0, 0, 255, 1);
        freeHandTool.defaults.StrokeColor = new Annotations.Color(0, 0, 255, 1);
        freeTextTool.defaults.TextColor = new Annotations.Color(0, 0, 255, 1);
    }
    else if (CustomColor.toLowerCase() == "orange") {
        strikeoutTool.defaults.StrokeColor = new Annotations.Color(255, 165, 0, 1);
        freeHandTool.defaults.StrokeColor = new Annotations.Color(255, 165, 0, 1);
        freeTextTool.defaults.TextColor = new Annotations.Color(255, 165, 0, 1);
    }
    else {
        strikeoutTool.defaults.StrokeColor = new Annotations.Color(255, 0, 0, 1);
        freeHandTool.defaults.StrokeColor = new Annotations.Color(255, 0, 0, 1);
        freeTextTool.defaults.TextColor = new Annotations.Color(255, 0, 0, 1);
    }
});


function showSignatureDialog() {
    var pagePt = readerControl.docViewer.getDisplayModeManager().getDisplayMode().pageToWindow({ x: 100, y: 100 }, 0);
    var event = {
        pageX: pagePt.x,
        pageY: pagePt.y,
        preventDefault: function () { }
    };

    var signatureTool = readerControl.toolModeMap['AnnotationCreateSignature'];
    readerControl.setToolMode('AnnotationCreateSignature');
    signatureTool.mouseLeftDown(event);
    signatureTool.mouseLeftUp(event);
}


function saveBlob(blob) {

    var fd = new FormData();
    fd.append('data', blob);
    $.ajax({
        type: 'POST',
        url: '/Negotiation/uploadBlob/',
        data: fd,
        processData: false,
        contentType: false
    }).done(function(data) {
        alert(data.message);
    }).fail(function (jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
    });
}
