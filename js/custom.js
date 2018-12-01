// Custom js for pdfTron testing 
var introJs = require('intro.js');

(function(){
	window.onload = init;

	function init () {

		var viewerElement = document.getElementById('viewer');
		
		var myWebViewer = new PDFTron.WebViewer({
		  path: 'lib',
		  l: 'demo:jared@veratech.co.nz:721d08bd0137bea577e64f4017b5b9a4768434555eb74ac8f8',
		  // replace with your own PDF file
		  initialDoc: 'docs/pdftron-instructions.pdf',
		  config: 'js/tron-config-purchaser.js',
		  mobileRedirect: false
		  // html5MobilePath: 'html5/ReaderControl.html'
		}, viewerElement);

		
	}

	//added app-dec class to adjust positioning a tooltip fix - Self calling
	var fixTooltip = function(){
		$('.approve, .decline').tooltip({
			container: 'body',
			template: '<div class="tooltip app-dec" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
		});
	}();

	// Prep and start intro guide js
	function introGuideJs(){
		var intro = introJs();
		intro.start();
	}
	introGuideJs();

  tippy('.secondary', { 
  	content: 'Most Recent', 
  	placement: 'top', 
  	showOnInit: true,
  	offset: '90, -155',
  	trigger: 'click',
  	interactive: true,
  	hideOnClick: false
  })

}());