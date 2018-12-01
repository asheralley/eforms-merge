ReaderControl.config.customStyle = ['/assets/negotiation/css/custom.min.css', '/assets/negotiation/css/tron.css'];
var CustomColor = window.ControlUtils.getCustomData();

$(document).on('viewerLoaded', function () {
    var docViewer = readerControl.docViewer;
    var annotManager = docViewer.getAnnotationManager();

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

    // hide default fitmodes button
    $('#fitModes').parent().hide();

    //hide the print  button
    $('#printButton').hide();
    $(".comments").hide();

    // hide fullscreen button
    $('#fullScreenButton').hide();

    var annotToolGroup = $('<div class="group"></div>');

    // make signature UI appear on click
    var signatureButton = $('<span id="initialSign" class="glyphicons customicons signature"></span>');
    signatureButton.on('click', function () {
        showSignatureDialog();
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
        console.log(action);

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

}); //viewer loaded ends




//$(document).on('noteCreated', function (e, annotation, noteElement) {
//    //var authorName = window.parent.authors[annotation.Author];
//    var authorName = document.getElementById("AuthorName");
//    $(noteElement).find('.noteAuthor').text(authorName);
//});

$(document).on('documentLoaded', function () {
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
    
    
    //remove all the blank notes

    var nonBlankAnnots = annotManager.getAnnotationsList().filter(function (annot) {
        return (annot.getContents() || '') !== '';
    });
    var blankAnnots = annotManager.getAnnotationsList().filter(function (annot) {
        return (annot.getContents() === null || annot.getContents() === '');
    });
    console.log("all Annots"); console.log(annotManager.getAnnotationsList());
    console.log("not blank" ); console.log(nonBlankAnnots);
    console.log("blank content" ); console.log(blankAnnots);

    //annotManager.hideAnnotations(annotManager.getAnnotationsList());
    //annotManager.on('annotationChanged', function (e, annotations, action) {
    //    e.Subject = "bing test";
    //    console.log(e);
    //    console.log(annotations);
    //    console.log(action);
    //});
    //var userAnnots1 = annotManager.getAnnotationsList().filter(function (annot) {
    //    return annot.Author === 'Purchaser Bob';
    //});
    //console.log(userAnnots);
    //console.log(userAnnots1);
    //annotManager.hideAnnotations(userAnnots);
    //var userAnnots = annotManager.getAnnotationsList();

    //userAnnots.forEach(function (element) {
    //    console.log(element.Subject);
    //});
    //annotManager.hideAnnotations(userAnnots);
});


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
