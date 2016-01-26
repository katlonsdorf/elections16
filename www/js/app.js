// Global jQuery references
var $cardsWrapper = null;
var $titlecard = null;
var $audioPlayer = null;
var $playToggleBtn = null;
var $globalHeader = null;
var $globalControls = null;
var $rewindBtn = null;
var $forwardBtn = null;
var $duration = null;
var $begin = null;
var $mute = null;
var $flickityNav = null;

// Global references
var candidates = {}
var isTouch = Modernizr.touch;
var currentState = null;
var rem = null;
var dragDirection = null;
/*
 * Run on page load.
 */
var onDocumentLoad = function(e) {
    $cardsWrapper = $('.cards');
    $cards = $('.card');
    $titlecard = $('.card').eq(0);
    $audioPlayer = $('.audio-player');
    $playToggleBtn = $('.toggle-btn');
    $rewindBtn = $('.rewind');
    $forwardBtn = $('.forward');
    $globalHeader = $('.global-header');
    $globalControls = $('.global-controls');
    $duringModeNotice = $('.during-mode-notice');
    $duration = $('.duration');
    $begin = $('.begin');
    $mute = $('.mute-button');

    rem = getEmPixels();

    $begin.on('click', onBeginClick);
    $playToggleBtn.on('click', AUDIO.toggleAudio);
    $mute.on('click', AUDIO.toggleAudio);
    $rewindBtn.on('click', AUDIO.rewindAudio);
    $forwardBtn.on('click', AUDIO.forwardAudio);
    $(window).resize(onResize);

    setupFlickity();
    AUDIO.setupAudio();
    setPolls();

    $cardsWrapper.css({
        'opacity': 1,
        'visibility': 'visible'
    });
}

var setupFlickity = function() {
    $cardsWrapper.height($(window).height());

    $cardsWrapper.flickity({
        cellSelector: '.card',
        cellAlign: 'center',
        draggable: isTouch,
        dragThreshold: 20,
        imagesLoaded: true,
        pageDots: false,
        setGallerySize: false,
        friction: isTouch ? 0.28 : 1,
        selectedAttraction: isTouch ? 0.025 : 1
    });

    $flickityNav = $('.flickity-prev-next-button');

    // bind events that must be bound after flickity init
    $cardsWrapper.on('cellSelect', onCardChange);
    $cardsWrapper.on('dragStart', onDragStart);
    $cardsWrapper.on('dragMove', onDragMove);
    $cardsWrapper.on('dragEnd', onDragEnd);
    $cardsWrapper.on('keydown', onKeydown);
    $flickityNav.on('click', onFlickityNavClick);
}

var onCardChange = function(e) {
    var flickity = $cardsWrapper.data('flickity');
    var oldSlideIndex = flickity.selectedIndex - 1;
    var newSlideIndex = flickity.selectedIndex;

    var $thisSlide = $('.is-selected');
    var cardHeight = $thisSlide.find('.card-inner').height();

    checkOverflow(cardHeight, $thisSlide);

    $globalHeader.removeClass('bg-header');

    if (newSlideIndex > 0) {
        $globalControls.show();
        $globalHeader.show();
        $duringModeNotice.show();
    } else {
        $globalControls.hide();
        $globalHeader.hide();
        $duringModeNotice.hide();
        $flickityNav.show();
    }

    if ($thisSlide.is('#podcast') && $audioPlayer.data().jPlayer.status.currentTime === 0) {
        AUDIO.setMedia(PODCAST_URL);
    }

    ANALYTICS.trackEvent('card-enter', $thisSlide.attr('id'));
}

var onDragStart = function(e, pointer) {
    dragDirection = null;
}

var onDragMove = function(e, pointer, moveVector) {
    if (moveVector.x > 0) {
        dragDirection = 'previous';
    } else {
        dragDirection = 'next';
    }
}

var onDragEnd = function(e, pointer) {
    var flickity = $cardsWrapper.data('flickity');
    var oldSlideIndex = flickity.selectedIndex - 1;
    var newSlideIndex = flickity.selectedIndex;

    if (dragDirection === 'previous') {
        ANALYTICS.trackEvent('card-swipe-previous');
    } else if (dragDirection === 'next') {
        ANALYTICS.trackEvent('card-swipe-next');
    } else {
        ANALYTICS.trackEvent('card-swipe-unknown');
    }
}

var onKeydown = function(e) {
    if (e.which === 37) {
        var keyDirection = 'previous';
    } else if (e.which === 39) {
        var keyDirection = 'next';
    } else {
        return false;
    }

    if (e.target !== $cardsWrapper[0]) {
        ANALYTICS.trackEvent('keyboard-nav-wrong-target')
    } else {
        ANALYTICS.trackEvent('keyboard-nav-' + keyDirection);
    }
}

var onFlickityNavClick = function(e) {
    if ($(this).hasClass('previous')) {
        ANALYTICS.trackEvent('nav-click-previous');
    } else if ($(this).hasClass('next')) {
        ANALYTICS.trackEvent('nav-click-next');
    } else {
        ANALYTICS.trackEvent('nav-click-unknown');
    }
}

var checkOverflow = function(cardHeight, $slide) {
    if (cardHeight > $(window).height()) {
        $slide.find('.card-background').height(cardHeight + (6 * rem));
    } else {
        $slide.find('.card-background').height('100%');
    }
}

var onBeginClick = function(e) {
    $cardsWrapper.flickity('next');
    ANALYTICS.trackEvent('begin-btn-click');
}

var setPolls = function() {
    // set poll for cards
    for (var i = 0; i < $cards.length; i++) {
        var $thisCard = $cards.eq(i);
        var refreshRoute = $thisCard.data('refresh-route');
        var refreshRate = $thisCard.data('refresh-rate');

        if (refreshRoute && refreshRate > 0) {
            var fullURL = APP_CONFIG.S3_BASE_URL + refreshRoute;
            var fullRefreshRate = refreshRate * 1000;

            var cardGetter = _.partial(getCard, fullURL, $thisCard, i);
            setInterval(cardGetter, fullRefreshRate)
        }
    }

    // set poll for state
    checkState();
    setInterval(checkState, 60000)
}

var getCard = function(url, $card, i) {
    setTimeout(function() {
        $.ajax({
            url: url,
            ifModified: true,
            success: function(data, status) {
                if (status === 'success') {
                    var $cardInner = $(data).find('.card-inner');
                    $card.html($cardInner);
                }
            }
        });
    }, i * 1000);
}

var checkState = function() {
    $.ajax({
        url: APP_CONFIG.S3_BASE_URL + '/current-state.json',
        dataType: 'json',
        ifModified: true,
        success: function(data) {
            if (status === 'success' && data['state'] !== currentState) {
                currentState = data['state']
            }
        }
    });
}

var onResize = function() {
    $cardsWrapper.height($(window).height());
    $cardsWrapper.flickity('resize');

    var $thisSlide = $cards.filter('.is-selected');
    var cardHeight = $thisSlide.find('.card-inner').height();
    checkOverflow(cardHeight, $thisSlide);
}

var getCandidates = function() {
    $.getJSON('assets/candidates.json', function(data) {
        return data;
    });
}

var makeListOfCandidates = function(candidates) {
    var candidateList = [];
    for (var i = 0; i < candidates.length; i++) {
        var firstName = candidates[i]['first'];
        var lastName = candidates[i]['last'];

        var candidateName = firstName + ' ' + lastName;

        candidateList.push(candidateName);
    }

    return candidateList;
}

$(onDocumentLoad);
