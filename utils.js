
const fs = require('fs');
const { google } = require('googleapis');

const generateJwtClient = () => {
    const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json'));
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events"
        ],
        process.env.CALENDAR_ID
    );

    return jwtClient
}

function arraysHaveSameStrings(arr1, arr2) {
    return arr1.length === arr2.length &&
        [...arr1].sort().join() === [...arr2].sort().join();
}

module.exports = {
    generateJwtClient,
    arraysHaveSameStrings
}