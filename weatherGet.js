var config = {
    apiKey: 'AIzaSyDSsWfzG7s-wRWAIrBD_r_RSlr1AioZ0CQ',
    authDomain: 'snowcalc.firebaseapp.com',
    databaseURL: 'https://snowcalc.firebaseio.com',
    projectId: 'snowcalc',
    storageBucket: 'snowcalc.appspot.com',
    messagingSenderId: '87152428247'
};

firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);

var collection = firebase.firestore().collection('weatherData');
var docData = collection.doc('sample').get();

var myFeatures = [];
var myLabels = [];

snowPredictor = new knnClassifier();

firestore.collection('weatherData').get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        var sf = doc.data().snowfall;
        var temp = doc.data().temperature;
        var wind = doc.data().wind;

        myFeatures.push([sf, temp, wind]);
        myLabels.push(doc.data().snowday ? 1 : 0);
        //snowday is a 1, 0 is not
    });
    snowPredictor.fit(myFeatures, myLabels);
    snowPredictor.splitData(.8);

    var bestK = snowPredictor.findK(3, myLabels.length)
    console.log(bestK);
});


$(document).ready(function() {
    $('#calculate').click(function() {
        var apiKey = '80f5260671f278dbabf1f6cf2ac42d16'
        var zipCode = '44094'
        var weatherGet = 'http://api.openweathermap.org/data/2.5/forecast?zip=' + zipCode + ',us&APPID=' + apiKey + '&units=imperial'
        
        $.getJSON(weatherGet,function(result){
            for (var i = 0; i < result.list.length; i++) {
                var thisDate = new Date(result.list[i]['dt'] * 1000)
                var localDate = new Date();
                if (thisDate.getDate() == localDate.getDate() + 1 && thisDate.getHours() <= 6 && thisDate.getHours() >= 4) {
                    var prediction = snowPredictor.predict(result.list[i], 1);
                    console.log(prediction);
                }
            }
        });
    });
});