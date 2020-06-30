# Stepify
Single page application that displays a list of items (with picture and description).

## Start
Install proyect
```bash
npm install
```
Start server
```bash
npm install
```

## Structure
### app.js
Backend
### index.html
Frontend

## Endpoints
[View on public Postman link](https://documenter.getpostman.com/view/11531662/T17DfoQN?version=latest)

## Tech
- HTML, CSS and Vanilla JavaScript
- Node.js (maybe Express.js/Deno)
- MongoDB
- Docker with docker-compose.yml (installing all required dependencies)

## Requirements
1. Sort the items on the list using a drag and drop functionality.
2. Counter in the page that shows how many items are being displayed.
3. Each item: Edit allows a user to update the image of an item and the description text. Delete allows a user to remove an item from the list and update the counter.
4. Add a new item: A form to upload an image (jpg, gif and png extensions of 320px x 320px size) and a description text (max chars 300).
5. All the actions of the application should be done without refreshing the page (sort, add, edit and delete) and saved immediately.
6. On a page refresh action, display the last state of the list.
7. State data stored in the backend.
8. Git repository with installation/execution instructions.