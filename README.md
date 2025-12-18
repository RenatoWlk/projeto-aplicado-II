# Applied Project II

<a href="https://quatrovidas-331626707561.southamerica-east1.run.app/"><img src="https://github.com/RenatoWlk/projeto-aplicado/blob/master/frontend/public/assets/logo.png" alt="Logo" width="152px" height="69px" style="align-items: end;"/></a>

Repository for the Applied Project II, a continuation of the [4 Vidas (Four Lives)](https://github.com/RenatoWlk/projeto-aplicado).

## Description

**Quatro Vidas** is a web platform designed to promote blood donation by connecting donors, blood banks, and partners in a single ecosystem.

The platform enables donors to schedule blood donations through a personal calendar, track their donation history, complete eligibility questionnaires, earn rewards, and locate nearby blood banks using an interactive map. Blood banks can manage campaigns, donation schedules, and appointment statuses while accessing detailed donation statistics. Partners can create and manage offers and rewards linked to donor participation.

The system was developed with usability, accessibility, and scalability in mind, using **Angular** for the frontend, **Spring Boot** for the backend, **MongoDB** for data storage, and **Docker** for containerized deployment on **Google Cloud Platform (GCP)**.

## Requirements

* [Node.js](https://nodejs.org/en/download)
* Angular 19+ `npm install -g @angular/cli@latest`
* [Java 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) (optional)

## How to Use

### Online Access
- Access the website [4 Vidas](https://quatrovidas-331626707561.southamerica-east1.run.app/)

### Local Setup

- **Step 1:**

Download or clone this repository using the link:

```
https://github.com/RenatoWlk/projeto-aplicado-II
```

- **Step 2:**

Open a command prompt, navigate to the `projeto-aplicado-II/backend` folder, and run the following commands:

```
gradlew build
gradlew bootRun
```

- **Step 3:**

Open another command prompt, navigate to the `projeto-aplicado-II/frontend` folder, and run the following commands:

```
yarn install
yarn run start
```

If you're not using Yarn, use:

```
npm install
ng serve --proxy-config proxy.conf.json
```

## Features

The platform provides a complete ecosystem connecting donors, blood banks, and partners to streamline blood donation management.

### 🩸 **Donor Features**

* Dashboard providing:
  - Blood bank campaigns
  - Partner offers
  - Nearby blood banks and distance calculation
  - Statistics and achievements
  - Leaderboards (top 50 most donations and most points)
* Personal calendar providing:
  - Schedule blood donations with blood bank, date, and available time
  - View appointment details such as blood bank contact info and scheduling status
  - Rest period control displaying the next eligible donation date
* Interactive map showing all nearby blood bank locations
* Donation eligibility questionnaire
* Rewards system based on achievements and participation
* Personal notifications system
* Profile screen including:
  - User data management
  - Achievements
  - Last questionnaire answered with download button
  - Personal donation history

### 🏥 **Blood Bank Features**

* Dashboard providing:
  - Creation and management of campaigns
  - Donation statistics:
    - Completed donations over time line chart (last 8 months)
    - Completed donations by blood type distribution (doughnut chart)
    - Total scheduled donations by users
    - Total donations since account creation
    - Average donations per month
* Calendar providing:
  - Publish available dates, times, and slots per time period
  - View published dates, times, slots and slot availability
  - Manage published dates
* Donation management:
  - Check dates with scheduled donations by users
  - View and change the status of appointments
  - View stats by status (pending, confirmed, completed, cancelled)
  - View general stats
* Profile screen for blood bank data management

### 🤝 **Partner Features**

* Dashboard providing:
  - Creation and management of offers
  - Creation and management of rewards
* Profile screen including:
  - Partner data management
  - Offers stats
  - Rewards stats

### 🌐 **Interface and Access**

* PWA (Progressive Web App) integration to deliver a user experience similar to a native mobile app
* Responsive and user-friendly UI
* Online and offline access
* Charts integration for donation management
* Geolocation integration via Nominatim API
* Leaflet map integration showing blood bank locations

### 🛡️ **Other Technical Features**

* Scalable and high-performance architecture
* Asynchronous communication between Angular frontend and Spring Boot backend
* JSON-based data exchange
* Secure data storage using MongoDB
* Docker-based containerization for deployment on Google Cloud Platform (GCP)
* Secure password encryption

## Folder Structure and Definitions

Main project folder structure and responsibilities:

```
projeto-aplicado-II/
├── backend/
│   └── src/main/java/com/projeto/aplicado/
│       ├── constants/                       # Centralized constants used across the backend
│       ├── controller/                      # REST controllers that handle API requests and responses
│       ├── dto/                             # Data Transfer Objects for request/response formatting
│       ├── exception/                       # Custom exceptions and global exception handling
│       ├── model/                           # Domain models, including MongoDB documents and core entities
│       ├── repository/                      # Interfaces extending MongoRepository for database operations
│       ├── security/                        # JWT-based authentication and authorization setup
│       └── service/                         # Business logic layer and service abstractions
└── frontend/
    ├── public/                              # Main application assets (icons, logos, map markers, etc.)
    └── src/app/
        ├── core/services/                   # Centralized services for authentication, route protection, and token management
        ├── layout/                          # Layout-related components (main layout, header, subheader, and footer)
        ├── pages/                           # Main pages components (dashboard, calendar, map, etc.)
        └── shared/                          # Reusable components and constants (constants, modals, preloaders, notifications, etc.)
```

## Credits

* [Renato Wilker de Paula Silva](https://github.com/RenatoWlk)
* [Vinicius Ferreira Paiola](https://github.com/vifp)
* [Pedro Barboza Valente](https://github.com/PedroBarboz4)
* [Gabriel Trindade](https://github.com/trindadegabriel)
* [Enzo Fischer](https://github.com/efsantoss)

---

Thank you for taking the time to explore this project!
