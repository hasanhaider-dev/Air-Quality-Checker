# Air Quality APP
This application introduces the following features through the endpoints and background jobs.
- /airquality endpoint to check the airquality details by invoking the [iqair]([url](https://api-docs.iqair.com/#important-notes)) API
- Background job that runs every minute to check the air quality of Paris zone, and store the information in the DB
- /pollutedtime endpoint to check the most polluted time of a specific zone by searching the records in the DB.
- Integration & unit tests of endpoints and services.


# How To Start?
1) open terminal at the root of this project directory
2) Run docker-compose build
3) Run docker-compose up

# API Documentation
You can test the endpoints by providing the respective parameters from the swagger UI using this URL: http://localhost:3005/docs
