
# RP Redmine
Create simple reports based on logged spend time during the day.

### Install:
```
yarn install
```

### Environment:
Copy `.env.dist` to `.env` and then fill `username/password`


### Generate the report file:
```
node main.js // today

node main.js --date=y // yesterday

node main.js --date=2023-11-13 // 2023-11-13 -> yyyy/mm/dd
```

### Ouput:
The result will be to create a file named `report_dd_mm_yyyy.html` in the `./reports` folder.
