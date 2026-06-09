# Express, Docker & PostgreSQL CRUD API

<!-- Badges display layout -->

[![CI Build Status](https://github.com/ifeanyinkwoji/express-postgres-crud/actions/workflows/ci.yml/badge.svg)](https://github.com/ifeanyinkwoji/express-postgres-crud/actions)
![Code Coverage](./badges/coverage.svg)
![Node Version](https://shields.io)
![Database](https://shields.io)

A clean, production-ready containerized CRUD REST API utilizing the modern Express web framework, Sequelize ORM, and integrated validation schemas via Joi.

## 🚀 Quick Start Instructions

1. Configure your local runtime properties inside a `.env` file.
2. Build and boot up your containers:
   ```bash
   docker compose up --build
   ```
3. Run the automated test runner inside your clean sandbox environment:
   ```bash
   docker compose run -e NODE_ENV=test web npm test
   ```
