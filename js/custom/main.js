var isPlaying;

var annotations = [];

$(document).ready( function() {

	$('video').on('loadedmetadata', function() {
		//initVideo();
	});

	$('#viewManifestButton').click(function() {
		var absoluteManifestURL = $('#manifestInput').val();
		window.open(absoluteManifestURL, '_blank', 'location=yes,height=600,width=580,scrollbars=yes,status=yes');
	});

	$('#parseManifestButton').click(function() {
		
		clearCanvases();

		var manifestURL = $('#manifestInput').val();

		parseManifestData(manifestURL, function() {
		
			var data = this;

			$('.title').text(data.label);
			$('.description').text(data.description);

			var canvasItems = [];
			if (Array.isArray(data.sequences)) {
				canvasItems = data.sequences[0].canvases;
			} else if (data.type == 'Canvas') {
				canvasItems.push(data);
			} else {
				canvasItems = data.sequences.canvases;
			}

			canvasInstances = [];

			for (var i=0; i<canvasItems.length; i++) {
				initCanvas(canvasItems[i]);
			}


		}, function() {
			
			$('.title').text('ERROR: Could not load manifest data.');
			$('.description').text('');
			console.log('ERROR: Could not load manifest data.', this);

		});
	});

});


function initVideo() {
	$('video').on('timeupdate', function() {
		updateMediaActiveStates();
	});

	initTranscript();
}

function updateMediaActiveStates(time) {

	//console.log("update active states");
	
	updateScrolling();


	var timelineItems = $('.timelineItem');

	timelineItems.each(function() {
		var currentItem = $(this),
			startTime = parseInt( currentItem.attr('data-start') ),
			endTime = parseInt( currentItem.attr('data-end') );

		if ( startTime <= time && endTime >= time ) {
			
			if (!currentItem.hasClass('active')) {
				currentItem.addClass('active');
				//loadTranscriptText(currentItem.attr('data-transcript-source'), 'transcript__original', 'original1')
			}

		} else {

			if (currentItem.hasClass('active')) {
				currentItem.removeClass('active');
			}

		}
	});

}

function formatTime(aNumber) {

	var hours, minutes, seconds, hourValue;

	seconds 	= Math.ceil(aNumber);
	hours 		= Math.floor(seconds / (60 * 60));
	hours 		= (hours >= 10) ? hours : '0' + hours;
	minutes 	= Math.floor(seconds % (60*60) / 60);
	minutes 	= (minutes >= 10) ? minutes : '0' + minutes;
	seconds 	= Math.floor(seconds % (60*60) % 60);
	seconds 	= (seconds >= 10) ? seconds : '0' + seconds;

	if (hours >= 1) {
		hourValue = hours + ':';
	} else {
		hourValue = '';
	}

	return hourValue + minutes + ':' + seconds;

}

function convertToPercentage(pixelValue, maxValue) {
	var percentage = (pixelValue / maxValue) * 100;
	return percentage;
}

function initTranscript(source, target, video) {
	$.getJSON( source, function( data ) {
		var items = [];
		$.each( data.words, function( key, val ) {
			if (val.word) {
				$('#'+target+' p').append('<span data-m="' + (val.start * 1000) + '">' + val.word + ' </span>');
			}
		});
	});
}

function updateScrolling() {
    var percentPlayed = $('video')[0].currentTime / $('video')[0].duration * 100;

    var containerHeight = $('.transcriptContainer').height();
    var containerScrollHeight = $('.transcriptContainer')[0].scrollHeight;
    var percentScrolled = (containerScrollHeight-containerHeight) / 100 * percentPlayed;
    var currentScrollTop = $('.transcriptContainer').scrollTop();
    $('.transcriptContainer').stop().animate({scrollTop:percentScrolled}, 500);
}

function clearCanvases() {
	$('.videoContainer').empty();

}