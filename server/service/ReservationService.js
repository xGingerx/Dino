const { dbReservations } = require('../firebase/firebase');
const cron = require('node-cron');
const UserService = require('./UserService');

class ReservationService {
    constructor() {
        this.timeIntervals = ["10-13", "13-16", "16-19", "19-22"];
    }

    static formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    async createReservationsForDate(date) {
        const formattedDate = ReservationService.formatDate(date); // Use static method
        const docRef = dbReservations.doc(formattedDate);

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
        const formattedDate = ReservationService.formatDate(date); // Use static method
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

    static async getAllReservations() {
        try {
            const snapshot = await dbReservations.get();
            if (snapshot.empty) {
                console.log('No reservations found.');
                return [];
            }

            const reservations = [];
            snapshot.forEach(doc => {
                reservations.push({ id: doc.id, ...doc.data() });
            });

            return reservations;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw new Error('Failed to retrieve reservations');
        }
    }

    static async addUserReservation(date, time, email) {
        try {
            date = new Date(date);
            const formattedDate = this.formatDate(date); // Call static method
            const docRef = dbReservations.doc(formattedDate);
            
            // Fetch the document
            const docSnapshot = await docRef.get();
            
            if (!docSnapshot.exists) {
                console.log(`No reservations found for ${formattedDate}.`);
                return null;
            }
            
            const data = docSnapshot.data();

            let userHasReservation = false;
            let previousTimeSlot = null;
            for(const [key, value] of Object.entries(data)){
                console.log(key, value, email)
                if(value == email) {
                    userHasReservation = true;
                    previousTimeSlot = key;
                    break;
                }
            }

            if (!data.hasOwnProperty(time)) {
                console.log(`Time slot ${time} does not exist.`);
                return null;
            }

            if (data[time]) {
                console.log(`Time slot ${time} is already occupied.`);
                return null;
            }

            if (userHasReservation) {
                await docRef.update({
                    [previousTimeSlot]: "" // Clear the old reservation
                });
                console.log(`Old reservation for ${email} at ${previousTimeSlot} on ${formattedDate} cleared.`);
                
            }
            await docRef.update({
                [time]: email
            });

            const updatedDocSnapshot = await docRef.get();
            const updatedData = updatedDocSnapshot.data();
            let user = await UserService.updateReservation(date, time, email);
            console.log(`Reservation for ${email} added on ${formattedDate} at ${time}.`);
            console.log(user)
            let returnData = {
                "user": user,
                "reservations": {}
            }
            returnData.reservations[date] = updatedData;
            return returnData;
        } catch (error) {
            console.error('Error adding user reservation:', error);
            throw new Error('Failed to add reservation');
        }
    }

    static async cancelReservation(date, time, email){
        date = new Date(date);
        const formattedDate = this.formatDate(date); // Call static method
        const docRef = dbReservations.doc(formattedDate);
        const docSnapshot = await docRef.get();
            
        if (!docSnapshot.exists) {
            console.log(`No reservations found for ${formattedDate}.`);
            return null;
        } 
        const data = docSnapshot.data();

        if (!data.hasOwnProperty(time)) {
            console.log(`Time slot ${time} does not exist.`);
            return null;
        }

        if (data[time]) {
            await docRef.update({
                [time]: ""
            });
            const updatedDocSnapshot = await docRef.get();
            const updatedData = updatedDocSnapshot.data();
            const user = await UserService.cancelReservation(date, time, email);
            let returnData = {
                "user": user,
                "reservations": {}
            }
            returnData.reservations[date] = updatedData;
            return returnData;
        }

        return null
    }
}

module.exports = ReservationService;
