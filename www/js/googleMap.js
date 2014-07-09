$(document).ready(function() {
    //Localisation dès le lancement
    navigator.geolocation.getCurrentPosition(geoloc.onSuccess, geoloc.onError, {enableHighAccuracy: true});
    $("#carte").show();

    //A la selection d'un client
    $("#clients").on('change', function() {
        //Si un marqueur existe, on le supprimme
        if(clientMarker != null) {
            clientMarker.setMap(null);
            clientMarker = null;
        } else {
            addClientMarker();
        }
    });
    
    $("#steps_button").click(function() {
        $("#carte").hide();
        $("#steps_div").show();
    });
    
    $("#backToMap_button").click(function() {
        $("#carte").show();
        $("#steps_div").hide();
    });
});

var map;
var div_carte = document.getElementById("carte");
var myLatLng;
var clientLatLng;
var clientMarker = null;
var stepDisplay;
var reqRes = null;


var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

//récupère la position
var geoloc = {
    onSuccess: function(position) {
        myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        createMap();
    },
    onError: function(error) {
        alert(
            'code: ' + error.code + '\n' +
            'message: ' + error.message + '\n'
        );
    }
};


//Crée une map avec la position du commercial
function createMap() {
    var mapOptions = {
        center: myLatLng,
        zoom: 12
    };

    map = new google.maps.Map(div_carte, mapOptions);
    
    //préparation pour un futur itineraire
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsService = new google.maps.DirectionsService();

    //Marker commercial
    var myMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title:"Vous êtes ici"
    });
    
    //InfoWindow commercial
    var myInfoWindow = new google.maps.InfoWindow ({
        content: '<div class="infoWindowDiv">infobulle commercial.</div>'
    });
    makeInfoWindowEvent(map, myInfoWindow, myMarker);
}


function makeInfoWindowEvent(map, infowindow, marker) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
}

//calcul de l'itinéraire
function getRoute(myLatLng, clientLatLng) {
    var request = {
       origin:myLatLng,
       destination:clientLatLng,
       travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
       if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
          directionsDisplay.setPanel(document.getElementById("steps_div"));
       }
    });
}

function addClientMarker() {
    // marker client
    var clientLoc = $("#clients").val().split(",");
    var clientLat = parseFloat(clientLoc[0]);
    var clientLng = parseFloat(clientLoc[1]);
    clientLatLng = new google.maps.LatLng(clientLat, clientLng);
 
    clientMarker = new google.maps.Marker({
        position: clientLatLng,
        map: map,
        title:"client"
    });
    
    //Fit bounds to markers
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(myLatLng);
    bounds.extend(clientLatLng);
    map.fitBounds(bounds);
    
    getRoute(myLatLng, clientLatLng);
    
    //InfoWindow client
    var clientInfoWindow = new google.maps.InfoWindow ({
        content: '<div class="infoWindowDiv">Infobulle client.</div>'
    });
    makeInfoWindowEvent(map, clientInfoWindow, clientMarker);
}

