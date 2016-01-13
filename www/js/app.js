// Global jQuery references
var $cards = null;
var $titlecard = null;

// Global references
var candidates = {}
var isTouch = Modernizr.touch;

/*
 * Run on page load.
 */
var onDocumentLoad = function(e) {
    $cards = $('.cards');
    $titlecard = $('.card').eq(0);

    setupFlickity();
}

var setupFlickity = function() {
    $cards.height($(window).height());

    $cards.flickity({
        cellSelector: '.card',
        cellAlign: 'center',
        draggable: isTouch,
        imagesLoaded: true,
        pageDots: false
    });

    // bind events
    $cards.on('cellSelect', onCardChange);
}

var onCardChange = function(e) {
    var flickity = $cards.data('flickity');
    var oldSlideIndex = flickity.selectedIndex - 1;
    var newSlideIndex = flickity.selectedIndex;
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
