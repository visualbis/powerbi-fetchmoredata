const fs = require('fs');

var total = parseInt(process.argv[2]) || 400000;
var size = Math.ceil(Math.sqrt(total));

console.log('size:', size);

var id = 0;
var data = [];

for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
        id++;
        var z = Math.random() * size * (x % 10) * (y % 10);
        var w = Math.random() * size;
        data.push({ id: id, x: x, y: y, z: z, w: w });
    }
}

function columnReplacer(name, value) {
    return value === null ? '' : value;
}

function convertToDelimited(data, delimiter) {
    // Adapted from: https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
    if (delimiter === undefined) {
        return JSON.stringify(data, columnReplacer);;
    }

    var json = JSON.parse(JSON.stringify(data, columnReplacer));
    var fields = Object.keys(json[0]);
    var replacer = function (key, value) { return value === null ? '' : value };
    var file = json.map(function (row) {
        return fields.map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer)
        }).join(delimiter)
    })
    file.unshift(fields.join(delimiter));
    return (file.join('\r\n'));
}

fs.writeFileSync(`${total}.csv`, convertToDelimited(data, ','), 'utf8');
