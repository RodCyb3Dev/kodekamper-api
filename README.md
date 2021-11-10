# KodeKamper API

> KodeKamper is an extensive REST API service provide for consumer to build their own frontend platform on demand.

##### This is a project includes:

- HTTP Essentials
- Postman Client
- RESTful APIs
- Express Framework
- Routing & Controller Methods
- MongoDB Atlas & Compass
- Mongoose ODM
- Advanced Query (Pagination, filter, etc)
- Models & Relationships
- Middleware (Express & Mongoose)
- MongoDB Geospatial Index / GeoJSON
- Geocoding
- Custom Error Handling
- User Roles & Permissions
- Aggregation
- Photo Upload
- Authentication With JWT & Cookies
- Emailing Password Reset Tokens
- Custom Database Seeder Using JSON Files
- Password & Token Hashing
- Security: NoSQL Injection, XSS, etc
- Creating Documentation
- Deployment With PM2, NGINX, SSL

## Usage

Rename "config/config.env.env" to "config/config.env" and update the values/settings with your own.

## Install Dependencies

`yarn` or `npm i`

## Run App

```
# Run in dev mode
yarn run dev

# Run in prod mode
yarn start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```
# Destroy all data
yarn run data:destroy

# Import all data
yarn run data:import
```

## Demo

The API is live at [kodekamper.app](https://kodekamper.app)

Test documentation with Postman [here](https://documenter.getpostman.com/view/8923145/SVtVVTzd?version=latest)

- Version: 1.0.0
- License: MIT
- Author: [Rodney Hammad](https://kodeflash.com)

#### Use Import Instead of Require in Node App

To `package.json` add "type": "module"

```json
{
  "name": "esm-modules",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["REST API", "API", "Postman", "CRUD", "Node"],
  "author": "Rodney Hammad",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1"
  },
  "type": "module"
}
```
