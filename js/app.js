var restaurants = [
  {
    name: "Starbucks",
    zomato_id: 17428829,
    type: "Coffee and Tea",
    lat: 39.186427,
    lng: -96.575871
  },
  {
    name: "Varsity Donuts",
    zomato_id: 17430348,
    type: "Coffee and Tea",
    lat: 39.185952,
    lng: -96.576194
  },
  {
    name: "Coco Bolos",
    zomato_id: 17428739,
    type: "Mexican",
    lat: 39.186609,
    lng: -96.576065
  },
  {
    name: "Fuzzy's Taco Shop",
    zomato_id: 17430547,
    type: "Mexican",
    lat: 39.185043,
    lng: -96.574734
  },
  {
    name: "Bi Bim Bap",
    zomato_id: 17430631,
    type: "Asian",
    lat: 39.186027,
    lng: -96.572866
  },
  {
    name: "Buffalo Wild Wings",
    zomato_id: 17428731,
    type: "Bar Food",
    lat: 39.185548,
    lng: -96.576225
  },
  {
    name: "Dancing Ganesha",
    zomato_id: 17430638,
    type: "Indian",
    lat: 39.186346,
    lng: -96.576268
  },
  {
    name: "Chipotle Mexican Grill",
    zomato_id: 17428737,
    type: "Mexican",
    lat: 39.185103,
    lng: -96.576080
  },
  {
    name: "Tubby's Sports Bar",
    zomato_id: 17428847,
    type: "Bar Food",
    lat: 39.185486,
    lng: -96.574546
  },
  {
    name: "Kite's Grille & Bar",
    zomato_id: 17428778,
    type: "Bar Food",
    lat: 39.185353,
    lng: -96.574970
  }
];

var Restaurant = function(data) {
  this.name = ko.observable(data.name);
  this.zomato_id = ko.observable(data.id);
  this.type = ko.observable(data.type);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);

  // // we need to get the zomato_id so we can more efficiently use the api
  // var zomatoUrl = "https://developers.zomato.com/api/v2.1/search?entity_id=Manhattan&entity_type=city&q=" + this.name;
  // $.ajax({
  //   url: zomatoUrl,
  //   beforeSend: function(xhr) {
  //        xhr.setRequestHeader("user-key", "a421d04cada88f728243c4ad9924a9dd");
  //   }, success: function(data){
  //       console.log(name);
  //       data.restaurants.forEach(function(entry) {
  //         if (entry.restaurant.name === name) {
  //           this.zomato_id = entry.restaurant.id;
  //           console.log(entry.restaurant.name);
  //           console.log(this.zomato_id);
  //         }
  //       });
  //       //process the JSON data etc
  //   }
  // });
}

var ViewModel = function() {
  var self = this;

  // complete list of restaurants
  this.allRsrtList = ko.observableArray([]);

  // list of restaurants to display
  this.displayRsrtList = ko.observableArray([]);

  // list of cuisine options, used for filter
  this.filterOptions = ko.observableArray([]);

  // adds cuisine options to filterOptions list
  this.addToFilterOptions = function(type) {
    var found = false;
    this.filterOptions().forEach(function(option) {
      if (option.name == type) {
        found = true;
      }
    });

    // insuring there are no repeats in the list
    if (found == false) {
      this.filterOptions.push({name: type});
    }
  };

  // using the initial data to create Restaurant objects
  restaurants.forEach(function(rsrt) {
    // restaurants get added to rsrtList
    self.allRsrtList.push(new Restaurant(rsrt));

    // cuisine types get added to the filterOptions list
    self.addToFilterOptions(rsrt.type);
  });

  // set the currently selected restaurant
  this.currentRsrt = ko.observable(this.allRsrtList()[0]);
  this.displayRsrtList(this.allRsrtList());

  this.setRsrt = function(clickedRsrt) {
    self.currentRsrt(clickedRsrt);
  }

  // filter the list of restaurants using the selected cuisine
  this.filterList = function() {
    clearMarkers(this.displayMarkers);

    this.selected = $('#filterOptions').val();
    this.displayRsrtList(this.allRsrtList().filter(this.checkRsrtList));
    // this.displayMarkers = this.allMarkers.filter(this.checkMarkerList);
  };

  this.checkRsrtList = function(rsrt) {
    return rsrt.type() == self.selected;
  };

  this.checkMarkerList = function(marker) {
    return marker.type == self.selected;
  }

  this.clearFilter = function() {
    this.displayRsrtList(this.allRsrtList());
    this.displayMarkers = this.allMarkers;
    showMarkers(this.map, this.displayMarkers);
  };
}

ko.applyBindings(new ViewModel())

// the google map
map = {};

// complete list of markers
allMarkers = [];

// list of markers to display
displayMarkers = [];

initMap = function() {
  var loc = {lat: 39.185353, lng: -96.574970};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: loc
  });

  createMarkers();
  displayMarkers = allMarkers;
  showMarkers();
};

createMarkers = function() {
  restaurants.forEach(function(restaurant) {
    var marker = new google.maps.Marker({
      position: {lat: restaurant.lat, lng: restaurant.lng},
      map: null,
      type: restaurant.type
    });

    var contentString = '<div id="infowindow>"' +
                        '<p><b>' + restaurant.name + '</b></p>' +
                        '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

    allMarkers.push(marker);
  });
};

clearMarkers = function() {
  setMapOnAll(null);
};

showMarkers = function() {
  setMapOnAll(map);
};

setMapOnAll = function(map) {
  for (var i = 0; i < displayMarkers.length; i++) {
    displayMarkers[i].setMap(map);
  }
};
