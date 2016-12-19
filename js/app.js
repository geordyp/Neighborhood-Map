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
  this.zomato_id = ko.observable(data.zomato_id);
  this.type = ko.observable(data.type);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
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
    toggleBounce(self.currentRsrt().zomato_id());
  }

  // filter the list of restaurants using the selected cuisine
  this.filterList = function() {
    clearMarkers();

    this.selected = $('#filterOptions').val();
    this.displayRsrtList(this.allRsrtList().filter(this.checkRsrtList));
    filterMarkers(this.selected);
    showMarkers();
  };

  this.clearFilter = function() {
    this.displayRsrtList(this.allRsrtList());
    this.displayMarkers = this.allMarkers;
    showAllMarkers();
  };

  this.checkRsrtList = function(rsrt) {
    return rsrt.type() == self.selected;
  };

  this.checkMarkerList = function(marker) {
    return marker.type == self.selected;
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
  showAllMarkers();
};

createMarkers = function() {
  restaurants.forEach(function(restaurant) {
    var marker = new google.maps.Marker({
      position: {lat: restaurant.lat, lng: restaurant.lng},
      map: null,
      zomato_id: restaurant.zomato_id,
      type: restaurant.type
    });

    marker.addListener('click', function() {
      // we need to get the zomato_id so we can more efficiently use the api
      var zomatoUrl = "https://developers.zomato.com/api/v2.1/restaurant?res_id=" + marker.zomato_id;
      var reviewData = {};
      $.ajax({
        url: zomatoUrl,
        beforeSend: function(xhr) {
             xhr.setRequestHeader("user-key", "a421d04cada88f728243c4ad9924a9dd");
        }, success: function(data){
            reviewData = data.user_rating;
            priceNum = data.price_range;
            priceStr = ""
            for (i = 0; i < priceNum; i++) {
              priceStr += "$";
            }

            var contentString = '<div id="infowindow>"' +
                                '<p><b>' + restaurant.name + '</b></p>' +
                                '<p><b>Aggregate Rating:&nbsp;&nbsp;</b>' + reviewData.aggregate_rating + '&nbsp;(' + reviewData.rating_text + ')</p>' +
                                '<p><b>Price Range:&nbsp;&nbsp;</b>' + priceStr + '</p>' +
                                '</div>';

            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });

            infowindow.open(map, marker);
        }
      });

      toggleBounce(marker.zomato_id);
    });

    allMarkers.push(marker);
  });
};

getContentById = function(zomato_id) {
  return "got it";
};

filterMarkers = function(option) {
  displayMarkers = [];
  allMarkers.forEach(function(marker) {
    if (marker.type == option) {
      displayMarkers.push(marker);
    }
  });
};

clearMarkers = function() {
  setMapOnAll(null);
};

showAllMarkers = function() {
  displayMarkers = allMarkers;
  showMarkers();
};

showMarkers = function() {
  setMapOnAll(map);
};

setMapOnAll = function(map) {
  for (var i = 0; i < displayMarkers.length; i++) {
    displayMarkers[i].setMap(map);
  }
};

getMarkerById = function(id) {
  var m = null;
  displayMarkers.forEach(function (marker) {
    // console.log(marker.zomato_id + " - " + id);
    if (marker.zomato_id === id) {
      m = marker;
    }
  });

  return m;
}

toggleBounce = function(rsrtClicked) {
  displayMarkers.forEach(function (marker) {
    marker.setAnimation(null);
  });

  var marker = getMarkerById(rsrtClicked);
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
