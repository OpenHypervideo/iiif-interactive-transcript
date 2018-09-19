var isPlaying,
	isMouseOver = false;

var annotations = [];

$(document).ready( function() {

	$('#getRandomManifestButton').click();

	$('video').on('loadedmetadata', function() {
		initVideo();
	});

	$('#transcript').on('click', 'span', function() {
		$('video')[0].currentTime = $(this).data('start');
	});

	$('#transcript').hover(function() {
        isMouseOver = true;
    }, function() {
        isMouseOver = false;
    });

	$('#viewManifestButton').click(function() {
		var absoluteManifestURL = $('#manifestInput').val();
		window.open(absoluteManifestURL, '_blank', 'location=yes,height=600,width=580,scrollbars=yes,status=yes');
	});

	$('#getRandomManifestButton').click(function() {
		getRandomManifestFromCollection('https://tomcrane.github.io/bbctextav/iiif/collection.json', function() {
			$('#parseManifestButton').click();
		});
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

			var duration = data.items[0].duration;

			//console.log(data.items[0].annotations[0].id);

			getJSONData(data.items[0].annotations[0].id, function() {

				annotations = this.items;

				for (var i=0; i<annotations.length; i++) {

					var temporal = /t=([^&]+)/g.exec(annotations[i].target);

					var t;
					if(temporal && temporal[1]) {
						t = temporal[1].split(',');
					} else {
						t = [0, duration];
					}

					var startTime = parseFloat(t[0]),
						endTime = parseFloat(t[1]);

					var transcriptItem = $('<span class="timebased" data-start="'+ startTime +'" data-end="'+ endTime +'"></span>');

					var formattedTimings = formatTime(startTime) +' - '+ formatTime(endTime);
					transcriptItem.append('<div class="timings">'+ formattedTimings +' </div>');
					transcriptItem.append('<p>'+ annotations[i].body.value +' </p>');

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

	if (!time) {
		time = $('video')[0].currentTime;
	}


	var timelineItems = $('#transcript .timebased');

	timelineItems.each(function() {
		var currentItem = $(this),
			startTime = parseInt( currentItem.attr('data-start') ),
			endTime = parseInt( currentItem.attr('data-end') );

		if ( startTime <= time && endTime >= time ) {
			
			if (!currentItem.hasClass('active')) {
				currentItem.addClass('active');
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

/*
function updateScrolling() {
    var percentPlayed = $('video')[0].currentTime / $('video')[0].duration * 100;

    var containerHeight = $('.transcriptContainer').height();
    var containerScrollHeight = $('.transcriptContainer')[0].scrollHeight;
    var percentScrolled = (containerScrollHeight-containerHeight) / 100 * percentPlayed;
    var currentScrollTop = $('.transcriptContainer').scrollTop();
    $('.transcriptContainer').stop().animate({scrollTop:percentScrolled}, 500);
}
*/

function updateScrolling() {
                                
    if (isMouseOver) {
        return;
    }
    
    var customhtmlContainer = $('.transcriptContainer'),
        firstActiveElement = customhtmlContainer.find('.timebased.active').eq(0);


    if ( firstActiveElement.length == 0 ) {
        return;
    }

    var activeElementPosition = firstActiveElement.position();

    if ( activeElementPosition.top <
        customhtmlContainer.height()/2 + customhtmlContainer.scrollTop()
        || activeElementPosition.top > customhtmlContainer.height()/2 + customhtmlContainer.scrollTop() ) {

        var newPos = activeElementPosition.top + customhtmlContainer.scrollTop() - customhtmlContainer.height()/2;
        customhtmlContainer.stop().animate({scrollTop : newPos}, 400);
    }

}

function getRandomManifestFromCollection(collectionURL, successCallback) {
	getJSONData(collectionURL, function() {
		var manifests = this.items;
		var randomID = Math.floor(Math.random() * (manifests.length - 0 + 1)) + 0;

		$('#manifestInput').val(manifests[randomID].id);

		if (successCallback) successCallback.call();

	}, function() {
		console.log('Could not retrieve collection');
	});
}  

function clearCanvases() {
	$('video').attr('src', '');
	$('#transcript').empty();

}