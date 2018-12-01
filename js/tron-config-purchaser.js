﻿ReaderControl.config.customStyle = ['/css/custom.min.css', '/css/tron.min.css'];
var CustomColor = window.ControlUtils.getCustomData();

if ($.mobile) {
  // do mobile specific customization
} else {
  // do desktop specific customization
  $(document).on('viewerLoaded', function () {
      var docViewer = readerControl.docViewer;
      var annotManager = docViewer.getAnnotationManager();




      // This is a right click event listener
      window.addEventListener('contextmenu', function(ev) {

        // Grab current annotation list from the viewer
        var userAnnots = annotManager.getAnnotationsList();
        console.log(userAnnots)

        // Loop through the annotation list
        for (var i = userAnnots.length - 1; i >= 0; i--) {
          // Conditional to check for 'FreeText' annotation and ones that 
          // have 'Guest' as their KA or author setting
          if (userAnnots[i].Subject === 'FreeText' && userAnnots[i].KA === 'Guest') {
              // For the matched annotations - reset Author to 'annexed' instead of Guest
              // via the author property
              userAnnots[i].Author = 'annexed';
          };
        };


      }, false); // right click event listener ends









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

      // add strikethrough & sigSta button to main panel
      function panelUpdates() {

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
          var buttonB = $('<span>').attr({
              'id': 'sigStamp',
              'class': 'annotTool glyphicons customicons signature',
              'title': 'Stamp Signature On Document'
          });
          rightAlignedElements.prepend(buttonA);
          rightAlignedElements.append(buttonB);

          // console.log(rightAlignedElements);

          // Move textbox

          function createTextToolListPanel() {
              // Grab toolList and re-append within the dom
              // Note that initial sign exists within the dom
              // but is hidden by css
              var parent = document.getElementById('initialSign').parentNode;
              var sign = document.getElementById('initialSign');
              var item = document.getElementById('toolList');
              parent.insertBefore(item, sign);

              // Move freText to the top of ToolList dom heirarchy
              $('#freeText').prependTo($('#toolList'));

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
      function updateSignatureUi() {

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
          //show the sign modal in the parant window
          // window.top.showSignModal();
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
                          var signatureRect = new Annotations.Rect(x, y, x + 25, y + 15);
                          signature.resize(signatureRect);
                          annotManager.addAnnotation(signature);
                          annotManager.redrawAnnotation(signature);

                          // ***Associated Sig 11-08-2018 - Assign an id Link stamp to sig annotation, this matches it to its
                          // associated annotation (strikeout, highlight, text etc), used in 
                          // trackAnd DeleteSig below
                          var addIdToSig = function (){
                              //Assign unique id copy to associated sigs
                              signature.id = annot.iB;
                          }();

                      }
                  });
              } // if current signature ENDS***
              else {
                  showSignatureDialog();
              }
          } // add Signature to custom annotations logic ENDS***

          //***Associated Sig 11-08-2018 - If any non signature item (strikeout, highlight, text etc) is deleted...
          if (action === 'delete' && annotations[0].Subject != 'Signature') {
              // Calls this to also delete associated sigStamp
              trackAndDeleteSig();
          };

          //***Associated Sig 11-08-2018 - Track and delete associated sig stamp for (strikeout, highlight, text etc)
          function trackAndDeleteSig () {
              // console.log(annot)
              var userAnnots = annotManager.getAnnotationsList();
              // Find deleted annotation
              annotations.forEach(function (annot) {
                  // Loop through all annotations to 
                  for (var i = 0; i < userAnnots.length; i++) {
                      // annot here always represents the cliked/deleted annotation (strikeout, highlight, text etc)
                      // userAnnots represents all annotations on the viewer, looks for id vs ib match from addIdToSig func
                      // above
                      if (annot.iB === userAnnots[i].id) {
                          // If match found delete sig with associated annotation 
                          annotManager.deleteAnnotation(userAnnots[i], false)
                      }
                  };
              });
          } // trackAndDeleteSig ENDS***
          
      }); // Annotation changed event listener ENDS***
      

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

  // Signature Stamp 
      var signatureStamp = function () {
          // Var to access doc viewer
          var docViewer = readerControl.docViewer;
          // Click event for toolList div to invoke functions
          // monitor and trigger active states. 
          $('#toolList').on('click', function(e){
              if (e.target.id != 'sigStamp'){
                  end()
              } else {
                  begin(e)
              }
          });

          // Event listener for annotation selection to turn of signature
          annotManager.on('annotationSelected', function(event, annotations, action) {
            if (action === 'selected') {
              end()
            } 
          });

          function begin (e) {
              // Set toolmode to edit to remove any tool
              // conflicts
              readerControl.setToolMode('AnnotationEdit')
              // console.log(readerControl)
              initSigStamp(e);
          }

          function end () {
              // Other toolList buttons so remove active from sigStamp button
              $('#sigStamp').removeClass('active');
              // Also remove loadTask event so doc clicks do not place double stamps
              docViewer.off('click', loadTask) 
          }

          function initSigStamp (e) {
              // Remove all other active classes from toolList when sigStamp is clicked
              $('#freeText, #strikethrough, .text_highlight, .comments').removeClass('active');
              // Set sigStamp ui button to active
              $('#sigStamp').addClass("active");
              // Initiate loadTask function
              docViewer.on('click', loadTask); // dblClick Ends
          }

          function loadTask (jqueryE, event) {
              // refer to getMouseLocation implementation above
              var getMouseLocation = function(event) {
                var scrollElement = $('#DocumentViewer');
                var scrollLeft = scrollElement.scrollLeft() || 0;
                var scrollTop = scrollElement.scrollTop() || 0;                   
                return {
                  x: event.pageX + scrollLeft,
                  y: event.pageY + scrollTop
                };
              }; // getMouseLocation Ends

              var windowCoordinates = getMouseLocation(event);
              // console.log(windowCoordinates)

              // Get selected pages
              var displayMode = docViewer.getDisplayModeManager().getDisplayMode();
              // Takes a start and end point but we just want to see where a single point is located
              var page = displayMode.getSelectedPages(windowCoordinates, windowCoordinates);
              var clickedPage = (page.first !== null) ? page.first : docViewer.getCurrentPage() - 1;
              // console.log(clickedPage)

              // Convert mouse window coordinates to page coordinates. 
              var pageCoordinates = displayMode.windowToPage(windowCoordinates, clickedPage);

              // Grab recorded signature
              var signature = annotManager.getAnnotationCopy(currentSignature);

                // Set annotation coords via page coords above
                var x = pageCoordinates.x
                var y = pageCoordinates.y

                // Create new annotation to contain the signature
                var signatureRect = new Annotations.Rect(x - 2, y - 5, x + 20, y + 15);
                // Resize the signature with rectangle Annotation object
                signature.resize(signatureRect);
                // Set correct page number for each annotation placement
                signature.PageNumber = pageCoordinates.pageIndex + 1;
                // Add and re-draw annotation
                annotManager.addAnnotation(signature);
                annotManager.redrawAnnotation(signature);

          } // loadTask Ends

  } // signatureStamp Ends

  // Call signatureStamp
  signatureStamp();


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

      // These are automatic triggers for tron ui methods. 
      // Makes and forces relevent ui behaviour
      $('#initialSign').trigger('click');
      $('#toggleNotesPanel').trigger('click');
      $('#timeSortButton').trigger('click');

      //$('#downloadButton').parent().off().on('click', function () {
      //    var options = {
      //        xfdfString: docViewer.getAnnotationManager().exportAnnotations()
      //    };
      //    var doc = docViewer.getDocument();
      //    doc.getFileData(options).then(function (data) {
      //        var arr = new Uint8Array(data);
      //        var blob = new Blob([arr], {
      //            type: 'application/pdf'
      //        });
      //        // upload blob here
      //        saveBlob(blob);
      //    });
      //});
    
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

  // click listener on toggleSidePanel
  var panelTester = document.getElementById('toggleSidePanel');
  panelTester.onclick = windowCollapseUiFix;
  

  function windowCollapseUiFix () {

      var prevPage = document.getElementById('prevPage');
      var pageNumberBox = document.getElementById('pageNumberBox');
      var totalPages = document.getElementById('totalPages');
      var nextPage = document.getElementById('nextPage');
      var leftBox = document.querySelector('.left-aligned');

      if (panelTester.classList.contains('collapse_left')) {
        prevPage.style.display = "block";
        pageNumberBox.style.display = "block";
        totalPages.style.display = "block";
        nextPage.style.display = "block";
        leftBox.style.width = '44em';
      } else {
        prevPage.style.display = "none";
        pageNumberBox.style.display = "none";
        totalPages.style.display = "none";
        nextPage.style.display = "none";
        leftBox.style.width = '22em';
      }

  } //windowCollapseUiFix

}



