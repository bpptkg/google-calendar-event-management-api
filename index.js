require('dotenv').config()
const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const yup = require('yup');
const { generateJwtClient, arraysHaveSameStrings } = require('./utils');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.AUTH_TOKEN) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    next();
};

app.use(authMiddleware);

// Define the validation schema - same for both create and update
const eventSchema = yup.object().shape({
    summary: yup.string().required('Summary is required'),
    description: yup.string().nullable(),
    location: yup.string().required('Location is required'),
    start: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
        .required('Start date is required'),
    end: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
        .required('End date is required'),
    attendees: yup.array()
        .of(yup.string().email('Invalid email format'))
        .required('Attendees are required'),
});

// Middleware for validation
const validateEvent = async (req, res, next) => {
    try {
        await eventSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        res.status(400).json({
            message: 'Validation error',
            errors: error.errors,
        });
    }
};

// Create event endpoint
app.post('/calendar', validateEvent, (req, res) => {
    const jwtClient = generateJwtClient();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const createEvent = async () => {
        const data = req.body;
        try {
            const event = {
                summary: data.summary,
                description: data.description,
                location: data.location,
                start: {
                    date: data.start,
                },
                end: {
                    date: data.end,
                },
                attendees: data.attendees.map(x => ({ email: x })),
            };

            const response = await calendar.events.insert({
                calendarId: process.env.CALENDAR_ID,
                resource: event,
                sendUpdates: 'all',
            });

            res.status(201).json({
                message: 'Event created',
                id: response.data.id,
                htmlLink: response.data.htmlLink
            });
        } catch (error) {
            console.error('Error creating event:', error.response);
            res.status(500).json({ message: 'Error creating event', error: error.message });
        }
    };

    createEvent().catch(console.error);
});

// Update event endpoint - now uses the same validation as create
app.put('/calendar/:eventId', validateEvent, (req, res) => {
    const jwtClient = generateJwtClient();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const updateEvent = async () => {
        const { eventId } = req.params;
        const data = req.body;

        try {
            const { data: oldEvent } = await calendar.events.get({
                calendarId: process.env.CALENDAR_ID,
                eventId: eventId,
            });

            if (data.summary === oldEvent.summary && data.description === oldEvent.description && data.location === oldEvent.location && data.start === oldEvent.start.date && data.end === oldEvent.end.date && arraysHaveSameStrings(data.attendees, oldEvent.attendees?.map(x => x.email))) {
                res.status(200).json({
                    message: 'Event not updated',
                    id: eventId,
                    htmlLink: oldEvent.htmlLink
                });
                return;
            }

            const event = {
                summary: data.summary,
                description: data.description,
                location: data.location,
                start: {
                    date: data.start,
                },
                end: {
                    date: data.end,
                },
                attendees: data.attendees.map(x => ({ email: x })),
            };

            const response = await calendar.events.update({
                calendarId: process.env.CALENDAR_ID,
                eventId: eventId,
                resource: event,
                sendUpdates: 'all',
            });

            res.status(200).json({
                message: 'Event updated',
                id: response.data.id,
                htmlLink: response.data.htmlLink
            });
        } catch (error) {
            console.error('Error updating event:', error.response);
            if (error.code === 404) {
                res.status(404).json({ message: 'Event not found' });
            } else {
                res.status(500).json({ message: 'Error updating event', error: error.message });
            }
        }
    };

    updateEvent().catch(console.error);
});

// Delete event endpoint
app.delete('/calendar/:eventId', (req, res) => {
    const jwtClient = generateJwtClient();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const deleteEvent = async () => {
        const { eventId } = req.params;
        try {
            await calendar.events.delete({
                calendarId: process.env.CALENDAR_ID,
                eventId: eventId,
                sendUpdates: 'all',
            });

            res.status(200).json({
                message: 'Event deleted successfully',
                id: eventId
            });
        } catch (error) {
            console.error('Error deleting event:', error.response);
            if (error.code === 404) {
                res.status(404).json({ message: 'Event not found' });
            } else {
                res.status(500).json({ message: 'Error deleting event', error: error.message });
            }
        }
    };

    deleteEvent().catch(console.error);
});

// Get event endpoint (helper endpoint to verify updates)
app.get('/calendar/:eventId', (req, res) => {
    const jwtClient = generateJwtClient();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const getEvent = async () => {
        const { eventId } = req.params;
        try {
            const response = await calendar.events.get({
                calendarId: process.env.CALENDAR_ID,
                eventId: eventId,
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error fetching event:', error.response);
            if (error.code === 404) {
                res.status(404).json({ message: 'Event not found' });
            } else {
                res.status(500).json({ message: 'Error fetching event', error: error.message });
            }
        }
    };

    getEvent().catch(console.error);
});

app.listen(port, () => {
    console.log(`Calendar app listening at http://localhost:${port}`);
});