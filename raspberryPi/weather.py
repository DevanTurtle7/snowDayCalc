#Devan Kavalchek
#Snow Day Predictor
#December 11th, 2018

import firebase_admin, requests, json, datetime, time
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime as dt

apiKey = '80f5260671f278dbabf1f6cf2ac42d16'
zipCode = '44094'

cred = credentials.Certificate('./ServiceAccountKey.json')
default_app = firebase_admin.initialize_app(cred)
db = firestore.client()

while True:
    print('checking time @ ' + str(dt.now().hour) + ':' + (str(dt.now().minute)))
    
    weatherGet = 'http://api.openweathermap.org/data/2.5/weather?zip=' + zipCode + ',us&APPID=' + apiKey + '&units=imperial'
    response = requests.get(weatherGet)
    weatherData = response.json()

    if dt.now().hour == 5 and dt.now().weekday() < 5:
        newDoc = db.collection(u'weatherData').document()
        snowfall = 0
        myTimeStamp = dt.now()
        myTimeStamp = myTimeStamp.replace(hour=myTimeStamp.hour+5)

        try:
            weatherData['snow']
            if len(weatherData['snow']) is not 0:
                    snowfall = weatherData['snow']['3h']
        except KeyError:
            print('no snow')
                    
        newDoc.set({
            u'snowday': False,
            u'snowfall': snowfall,
            u'temperature': weatherData['main']['temp'],
            u'wind': weatherData['wind']['speed'],
            u'timestamp': myTimeStamp
        })

        print('written')

    time.sleep(60*60) #Check the time every hour
