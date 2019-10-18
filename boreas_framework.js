//Boreas ML
//Devan Kavalchek
//December 6th, 2018

class knnClassifier {
    //#region Fit
    fit(features, labels) {
        this.features = features;
        this.labels = labels;
        this.num0s = 0;
        this.num1s = 0;

        for (var i = 0; i < labels.length; i++) {
            if (labels[i] == 0) {
                this.num0s += 1;
            } else if (labels[i] == 1) {
                this.num1s += 1;
            }
        }

        //#region Functions
        //#region Normalize
        function normalize(_data) {
            /*
            This function normalizes an array. Normalizing is essential
            to machine learning so that all features are weighed out
            equally. Without normalization, and the axis of a graph
            were on different scales, the distance formula would
            not work well because the scale would be skewed. This
            sets the values to a point between 0 and 1.
            */
            var _min = Math.min(..._data);
            var _max = Math.max(..._data);
            var _normalized = [];
        
            for (var i = 0; i < _data.length; i++) {
                _normalized.push((_data[i] - _min) / (_max - _min));
            }
        
            return _normalized;
        }
        //#endregion
        
        //#region Zip
        function zip(array) {
            var tempArray = [];
        
            for (var i = 0; i < array[0].length; i++) {
                var adding = [];
                
                for (var x = 0; x < array.length; x++) {
                    adding.push(array[x][i]);
                }
                tempArray.push(adding);
            }
        
            return tempArray;
        }
        //#endregion

        //#region Unzip
        function unzip(array) {
            var tempArray = [];
        
            for (var i = 0; i < array[0].length; i++) {
                tempArray.push([]);
            }
        
            for (var i = 0; i < array.length; i++) {
                for (var x = 0; x < array[i].length; x++) {
                    tempArray[x].push(array[i][x]);
                }
            }
        
            return tempArray;
        }
        //#endregion
        //#endregion

        //NORMALIZE
        var unzipped = unzip(this.features);
        var normalized = [];

        for (var i = 0; i < unzipped.length; i++) {
            normalized.push(normalize(unzipped[i]));
        }
        zip(normalized);
        this.features = normalized;
    }
    //#endregion
    
    //#region SplitData
    splitData(percent) {
        if (percent > 1) {
            throw 'Data split cannot be larger than 1'
        }

        //#region ShuffleTogether
        function shuffleTogether(array1, array2) {
            //#region Description
            /*
            This function is used when you want to shuffle 2 arrays at the same
            time such as labels and features. If you didn't use this, and shuffled
            the arrays separately, the label would no longer match the feature
            because all the elements would be in random positions.
            */
           //#endregion
            var indexsLeft = [];
            var shuffled1 = [];
            var shuffled2 = [];
        
            for (var i = 0; i < array1.length; i++) {
                shuffled1.push(null);
                shuffled2.push(null);
                indexsLeft.push(i);
            }
        
            for (var i = 0; i < array1.length; i++) {
                var usedIndex = Math.floor(Math.random() * (indexsLeft.length))
                shuffled1[indexsLeft[usedIndex]] = array1[i];
                shuffled2[indexsLeft[usedIndex]] = array2[i];
                indexsLeft.splice(usedIndex, 1);
            }
        
            return {
                shuffled1: shuffled1, 
                shuffled2: shuffled2
            };
        }
        //#endregion

        if (percent == null) {percent=.8;}
    
        var shuffledData = shuffleTogether(this.features, this.labels);
        var shuffledFeatures = shuffledData.shuffled1;
        var shuffledLabels = shuffledData.shuffled2;
        //var trainingFeatures = shuffledFeatures.slice(0, Math.floor(shuffledFeatures.length * percent));
        //var trainingLabels = shuffledLabels.slice(0, Math.floor(shuffledLabels.length * percent));
        var validationFeatures = shuffledFeatures.slice(Math.floor(shuffledFeatures.length * percent), shuffledFeatures.length);
        var validationLabels = shuffledLabels.slice(Math.floor(shuffledLabels.length * percent), shuffledLabels.length)

        //this.trainingFeatures = trainingFeatures;
        //this.trainingLabels = trainingLabels;
        //this.trainingSet = [trainingFeatures, trainingLabels];
        this.validationLabels = validationLabels;
        this.validationFeatures = validationFeatures;
        this.validationSet = [validationFeatures, validationLabels];
    }
    //#endregion
    
    //#region FindK
    findK(min, max) {
        var bestK = min;
        var bestAcc = 0;
    
        for (var i = min; i < Math.min(max, this.num1s, this.num0s); i++) { //Makes sure that K isn't greater than the number of 1s or the number of 0s or else it will be unaccurate
            var accuracy = this.getAccuracy(i);
            if (bestAcc < accuracy) {
                bestK = i;
                bestAcc = accuracy;
            }
        }
        return bestK;
    }
    //#endregion

    //#region Predict
    predict(unknown, k) {
        if (k == null) {
            throw 'K must be defined to predict'
        }
        //#region Functions
        //#region Distance
        function distance(p1, p2) {
            //Euclidean distance
            var _result = 0;
        
            for (var i = 0; i < p1.length; i++) {
                _result += (p1[i] - p2[i]) ^ 2;
            }
            _result = Math.sqrt(_result);
        
            return _result;
        }
        //#endregion

        //#region Unzip
        function unzip(array) {
            var tempArray = [];
        
            for (var i = 0; i < array[0].length; i++) {
                tempArray.push([]);
            }
        
            for (var i = 0; i < array.length; i++) {
                for (var x = 0; x < array[i].length; x++) {
                    tempArray[x].push(array[i][x]);
                }
            }
        
            return tempArray;
        }
        //#endregion
        //#endregion

        //NORMALIZE POINT
        var minsMaxs = [];
        var unzippedData = unzip(this.features);

        for (var i = 0; i < unzippedData.length; i++) {
            minsMaxs.push([Math.min(...unzippedData[i]), Math.max(...unzippedData[i])]);
        }

        for (var i = 0; i < minsMaxs.length; i++) {
            var currentMin = minsMaxs[i][0];
            var currentMax = minsMaxs[i][1];

            unknown[i] = (unknown[i] - currentMin) / (currentMax - currentMin);
        }
        
        //////////////////////////
        var distances = [];

        for (var i = 0; i < this.features.length; i++) {
            distances.push([distance(this.features, unknown), i]);
        }
    
        distances.sort();
        var neighbors = distances.slice(0, k + 1);
    
        var nA = 0;
        var nB = 0;
    
        for (var i = 0; i < neighbors.length; i++) {
            //Check the surrounding neighbors to see which are A and which are B
            if (this.labels[neighbors[i][1]] == 0) {
                nA += 1;
            } else if (this.labels[neighbors[i][1]] == 1) {
                nB += 1;
            }
        }
    
        if (nA > nB) {
            return 0;
        } else {
            return 1;
        }
    }
    //#endregion

    //#region GetAccuracy
    getAccuracy(k) {
        /*
        if (this.validationSet == null || this.trainingSet == null) {
            throw 'Training data and validation data has not been split'
        }
        */
       if (this.validationSet == null) {throw 'Validation data has not been split';}
        var nCorrect = 0;

        for (var i = 0; i < this.validationFeatures.length; i++) {
            var guess = this.predict(this.validationFeatures[i], k);
            if (guess == this.validationLabels[i]) {
                nCorrect += 1
            } else {
                //console.log(validation_set[i] + ', ' + guess);
            }
        }

        return nCorrect / this.validationFeatures.length;
    }
    //#endregion
}