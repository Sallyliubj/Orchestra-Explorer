// Main JavaScript file for Orchestra Explorer

$(document).ready(function() {
    // Add active class to current navigation item
    const currentPath = window.location.pathname;
    $('.nav-link').each(function() {
        const href = $(this).attr('href');
        if (currentPath === href || currentPath.startsWith(href) && href !== '/') {
            $(this).addClass('active');
        }
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle instrument sound playback
    $('.play-sound').click(function() {
        const instrument = $(this).data('sound');
        // TODO: Implement actual sound playback
        console.log('Playing sound for: ' + instrument);
    });

    // Add loading animation for page transitions
    $('a').not('[target="_blank"]').click(function() {
        $('.container').fadeOut(200);
    });
}); 