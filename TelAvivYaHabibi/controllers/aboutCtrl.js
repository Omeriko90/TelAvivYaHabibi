
angular.module('aboutCtrl', [])

    .controller("aboutCtrl",function ($scope,slide) {
        slide.showSlides($scope.slideIndex);

    })

    .service("slide",function () {
        var slide={};
        slide.slideIndex=0;
        var i;
        var slides = document.getElementsByClassName("mySlides");
        var dots = document.getElementsByClassName("dot");
        slide.showSlides=function() {
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slide.slideIndex++;
            if (slide.slideIndex > slides.length) {
                slide.slideIndex = 1
            }
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            slides[slide.slideIndex - 1].style.display = "block";
            dots[slide.slideIndex - 1].className += " active";
            setTimeout(slide.showSlides, 2000); // Change image every 2 seconds
        };
        return slide;
    });