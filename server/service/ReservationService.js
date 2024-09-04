const { dbReservations } = require('../firebase/firebase');
const cron = require('node-cron');

class ReservationService {
    constructor() {
        this.timeIntervals = ["10-13", "13-16", "16-19", "19-22"];
    }

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    async createReservationsForDate(date) {
        const formattedDate = this.formatDate(date);
        const docRef = dbReservations.doc(formattedDate);

        // Check if document already exists
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            console.log(`Document for ${formattedDate} already exists. Skipping creation.`);
            return;
        }

        let slots = {};
        this.timeIntervals.forEach(interval => {
            slots[interval] = "";
        });

        await docRef.set(slots);
        console.log(`Document for ${formattedDate} created.`);
    }

    async deleteReservationsForDate(date) {
        const formattedDate = this.formatDate(date);
        await dbReservations.doc(formattedDate).delete();
        console.log(`Document for ${formattedDate} deleted.`);
    }

    async initializeReservations() {
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            await this.createReservationsForDate(date);
        }
    }

    async dailyReservationUpdate() {
        try {
            console.log('Running daily update task: Creating and Deleting reservations.');

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await this.deleteReservationsForDate(yesterday);

            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            await this.createReservationsForDate(nextWeek);

            console.log('Daily update task completed successfully.');
        } catch (error) {
            console.error('Error in daily update task:', error);
        }
    }

    startAutoReservationManagement() {
        this.initializeReservations();

        cron.schedule('0 0 * * *', async () => {
            await this.dailyReservationUpdate();
        });
    }
}

module.exports = ReservationService;
