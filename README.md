<img src="https://github.com/RenatoWlk/projeto-aplicado/blob/master/frontend/public/assets/logo.png" alt="Logo" width="152px" height="69px" style="align-items: end;"/>

# Applied Project I

Repository for the Applied Project I. A web application developed using Spring Boot and Angular called 4vidas (four lives).

## Description

**Quatro Vidas** is a web platform focused on promoting blood donation, connecting donors, blood banks, and partners. The system allows the registration of different user profiles, enables the monitoring of donation history, blood levels in blood banks, facilitates scheduling future donations through a personal calendar and much more.

The application features an interactive dashboard, an achievement-based reward system, a map to locate nearby blood banks, and a eligibility questionnaire for donors. Developed with usability and accessibility in mind, the system uses Angular for the frontend, Java with Spring Boot for the backend, and MongoDB as the database.

## Dependencies

* [Node.js](https://nodejs.org/en/download)
* Angular 19+ `npm install -g @angular/cli@latest`
* [Java 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) (optional)

## How to Use

**Step 1:**

Download or clone this repository using the link:

```
https://github.com/RenatoWlk/projeto-aplicado
```

**Step 2:**

Open a command prompt, navigate to the `projeto-aplicado/backend` folder, and run the following commands:

```
gradlew build
gradlew bootRun
```

**Step 3:**

Open another command prompt, navigate to the `projeto-aplicado/frontend` folder, and run the following commands:

```
yarn install
yarn run build
yarn run start
```

If you're not using Yarn, use:

```
npm install
ng build
ng serve --proxy-config proxy.conf.json
```

## Features

🔐 **Authentication and Registration**

* Donor registration and login
* Blood bank registration and login
* Partner registration and login

🩸 **Donor Features**

* Dashboard with:
  - Blood bank campaigns
  - Partner offers
  - Nearby blood banks and distance
  - Stats and achievements
  - Leaderboards (top 50 most donations and most points)
* Donation eligibility questionnaire
* Track remaining time until the next allowed donation
* Personal calendar for scheduling donations
* View personal donation appointments
* Map showing nearby blood banks
* Profile screen with user data, achievements, management and last questionnaire
* Reward system based on achievements and participation
* Personal donation history
* Donation statistics

🏥 **Blood Bank Features**

* Publish blood donation campaigns
* Publish specific blood needs
* Dashboard with:
  - Blood donation over time line chart (last 8 months)
  - Blood types distribution doughnut chart (with total blood bags and total liters by blood type)
  - Total donations since account creation
  - Total scheduled donations by users
  - Average donations per month
* publish available dates and times for donations
* Profile screen with blood bank data

🤝 **Partner Features**

* Publish promotional offers for donors
* Share available rewards

🌐 **Interface and Access**

* Responsive and user-friendly UI
* Fully online system (requires internet connection)
* REST API communication between frontend and backend
* Charts integration for donations and blood levels management
* Map integration showing blood bank locations

🛡️ **Other Technical Features**

* Secure data storage using MongoDB
* Password encryption and decryption
* Scalable and high-performance architecture
* Asynchronous communication between Angular frontend and Spring Boot backend
* JSON-based data exchange

### Folder Structure and definition

Main folder structure and definitions:

```
projeto-aplicado/
├── backend/
│   └── src/main/java/com/projeto/aplicado/
│       ├── constants/                        # Centralized constants used across the backend
│       ├── controller/                       # REST controllers that handle API requests and responses
│       ├── dto/                              # Data Transfer Objects for request/response formatting
│       ├── model/                            # Domain models, including MongoDB documents and other core entities
│       ├── repository/                       # Interfaces extending MongoRepository for MongoDB operations
│       ├── security/                         # JWT-based authentication and authorization setup
│       ├── service/                          # Business logic layer and service abstractions
│       └── BackendApplication.java           # Main Spring Boot application entry point
└── frontend/
    ├── public/                               # Main application assets (icons, logos, map-markers, etc.)
    └── src/
        ├── app/
        │   ├── core/services/                # Centralized services for authentication, route protection and token management
        │   ├── layout/                       # Layout-related components (main-layout, header, subheader and footer)
        │   ├── pages/                        # Main pages components (dashboard, calendar, map, account, questionnaire, register, login, forgot-password)
        │   ├── shared/                       # Reusable components and constants (modal, form, preloader, notification, constants and enums)
        │   └── app.routes.ts                 # Main route definitions for the application
        ├── index.html                        # Main HTML file loaded in the browser
        ├── main.ts                           # Entry point for bootstrapping the Angular application
        └── styles.scss                       # Global styles applied across the entire app
```

## Credits

* [Renato Wilker de Paula Silva](https://github.com/RenatoWlk)
* [Pedro Barboza Valente](https://github.com/PedroBarboz4)
* [Vinicius Ferreira Paiola](https://github.com/vifp)
* [Gabriel Trindade](https://github.com/trindadegabriel)
* [Enzo Fischer](https://github.com/efsantoss)
