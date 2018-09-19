var isPlaying;

var annotations = [];

$(document).ready( function() {

	$('#manifestInput').val('https://tomcrane.github.io/bbctextav/iiif/ID191002001.json');

	$('video').on('loadedmetadata', function() {
		initVideo();
	});

	$('#transcript').on('click', 'span', function() {
		$('video')[0].currentTime = $(this).data('start');
	});

	$('#viewManifestButton').click(function() {
		var absoluteManifestURL = $('#manifestInput').val();
		window.open(absoluteManifestURL, '_blank', 'location=yes,height=600,width=580,scrollbars=yes,status=yes');
	});

	$('#parseManifestButton').click(function() {
		
		clearCanvases();

		var manifestURL = $('#manifestInput').val();

		getJSONData(manifestURL, function() {
		
			var data = this;

			$('.title').text(data.label.de);

			var videoSrc = data.items[0].items[0].items[0].body.id;
			$('video').attr('src', videoSrc);
			$('video').load();

			getJSONData(data.items[0].annotations.id, function() {

				annotations = this;

				for (var i=0; i<annotations.length; i++) {

					var transcriptItem = $('<span class="timebased" data-start="0" data-end="1"></span>');

					transcriptItem.text('TEXT');

					$('#transcript').append(transcriptItem);

				}
			}, function() {

				$('.title').text('ERROR: Could not load annotation data.');
				$('.description').text('');
				console.log('ERROR: Could not load annotation data.', this);

			});
			
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

function getJSONData(dataURL, successCallback, errorCallback) {
	
	$.ajax({
		type: 'GET',
		url: dataURL,
		cache: false,
		dataType: 'json',
		mimeType: 'application/json' 
	}).done(function(response) {
		
		if (successCallback) successCallback.call(response);

	}).fail(function(response) {

		if (errorCallback) errorCallback.call(response);

	});

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
	$('video').attr('src', '');
	$('#transcript').empty();

}