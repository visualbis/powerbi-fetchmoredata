# powerbi-fetchmoredata
Sample Power BI Custom Visual that uses the fetchMoreData API

## Sample data
To create sample data, run:
```
node .\mock-csv.js
```
Which produces a .csv file.

## Power BI
1. Import sample data into Power BI online.
1. Create a new report.
1. `pbiviz start`
1. Add custom visual to report.
1. Add x field
1. Select "Don't summarize" on x field.
1. Repeat above for y field

## Result
![image](https://user-images.githubusercontent.com/11507384/65347985-fbf08f00-db94-11e9-9a04-381d3988a38a.png)
