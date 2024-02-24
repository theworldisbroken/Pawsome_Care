const cron = require('node-cron');
const Booking = require('../BookingModel');
const moment = require('moment');


const startBookingsScheduler = () => {
    cron.schedule('0,15,30,45 * * * *', async () => {
        console.log('Scheduler läuft, um den Status von Buchungen zu aktualisieren.');

        try {
            const currentTime = moment().format('HH:mm');
            const todayDate = new Date().toISOString().split('T')[0];

            const bookings = await Booking.find({
                $or: [
                    {
                        status: 'accepted',
                        date: { $lte: todayDate },
                        startTime: { $lte: currentTime }
                    },
                    {
                        status: 'current',
                        date: { $lte: todayDate },
                        endTime: { $lte: currentTime }
                    },
                    {
                        status: 'requested',
                        date: { $lte: todayDate },
                        startTime: { $lte: currentTime }
                    }
                ]
            });

            console.log(bookings)

            for (const booking of bookings) {
                if (booking.status === 'accepted' && booking.startTime <= currentTime) {
                    booking.status = 'current';
                    await booking.save();
                }
                else if (booking.status === 'requested' && booking.startTime <= currentTime) {
                    booking.status = 'declined';
                    await booking.save();
                }
                else if (booking.status === 'current' && booking.endTime <= currentTime) {
                    booking.status = 'done';
                    await booking.save();
                }
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Buchungen:', error);
        }
    });
}

module.exports = startBookingsScheduler;
