var fs = require('fs');

var filename = process.argv[2];
fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var configuration = JSON.parse(data);
    var parameterString = "";
    (configuration.forEach(function (x) {
        parameterString += "ParameterKey=" + x["ParameterKey"] + ",ParameterValue=" + x["ParameterValue"] + " ";
    }));
    console.log(parameterString);
});