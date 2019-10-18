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
    print('------------------------------------------')
    currentDay = dt.now().day
    currentHour = dt.now().hour
    
    weatherGet = 'http://api.openweathermap.org/data/2.5/forecast?zip=' + zipCode + ',us&APPID=' + apiKey + '&units=imperial'
    response = requests.get(weatherGet)
    weatherData = response.json()
    
    for i in range(0, len(weatherData['list'])):
        thisDate = weatherData['list'][i]['dt_txt']
        thisDay = dt.strptime(thisDate, '%Y-%m-%d %H:%M:%S').day
        thisHour = dt.strptime(thisDate, '%Y-%m-%d %H:%M:%S').hour

        if currentDay == thisDay:
            print('days match')
            if currentHour == 2:
                print('its 2')
                if thisHour == 3:
                    print('found 3:00')
                    newDoc = db.collection(u'weatherData').document()
                    snowfall = 0

                    try:
                        weatherData['list'][i]['snow']
                        if len(weatherData['list'][i]['snow']) is not 0:
                            snowfall = weatherData['list'][i]['snow']['3h']
                    except KeyError:
                        print('no snow')
                    
                    newDoc.set({
                        u'snowday': False,
                        u'snowfall': snowfall,
                        u'temperature': weatherData['list'][i]['main']['temp'],
                        u'wind': weatherData['list'][i]['wind']['speed']
                    })

                    print('written')
                    
    print('------------------------------------------')
    time.sleep(60*60) #Check the time every hour
