const { doc, getDoc, setDoc, deleteDoc, collection, getDocs, dbReservations } = require('../firebase/firebase');
const cron = require('node-cron');
const UserService = require('./UserService');

class ReservationService {
    constructor() {
        this.timeIntervals = ["10 to 13", "13 to 16", "16 to 19", "19 to 22"];
    }

    static formatDate(date) {
        const day = String(date.getDate());
        const month = String(date.getMonth() + 1);
        const year = date.getFullYear();
        return `${day}\\${month}\\${year}`;
    }

    async createReservationsForDate(date) {
        const formattedDate = ReservationService.formatDate(date); 
        const docRef = doc(dbReservations, formattedDate); 

        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            console.log(`Document for ${formattedDate} already exists. Skipping creation.`);
            return;
        }

        await setDoc(docRef, {});
        console.log(`Document for ${formattedDate} created.`);

        this.timeIntervals.forEach(async interval => {
            const intervalCollectionRef = collection(docRef, interval); 
            await setDoc(doc(docRef, interval, 'temp'), {});  
        });

        console.log(`Collections for time slots created under ${formattedDate}.`);
    }

    async deleteReservationsForDate(date) {
        const formattedDate = ReservationService.formatDate(date); 
        const docRef = doc(dbReservations, formattedDate);
        await deleteDoc(docRef);
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
            const snapshot = await getDocs(dbReservations);
    
            if (snapshot.empty) {
                console.log('No reservations found.');
                return {};
            }
    
            const allReservations = {};
            const timeIntervals = ["10 to 13", "13 to 16", "16 to 19", "19 to 22"]; 
    
            for (const docSnap of snapshot.docs) {
                const date = docSnap.id; 
                if(date == this.formatDate(new Date())) {
                    continue;
                } 
                
                allReservations[date] = {};  
    
                for (const interval of timeIntervals) {
                    const timeSlotCollectionRef = collection(docSnap.ref, interval); 
                    const timeSlotDocs = await getDocs(timeSlotCollectionRef);  
                    allReservations[date][interval] = timeSlotDocs.size - 1;
                }
            }
            return allReservations;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw new Error('Failed to retrieve reservations');
        }
    }
    

    static async addUserReservation(date, time, email) {
        try {
            const timeIntervals = ["10 to 13", "13 to 16", "16 to 19", "19 to 22"]; 
            const formattedDate = date;
            const docRef = doc(dbReservations, formattedDate);
            const timeCollection = collection(docRef, time)
            const intervals = await getDocs(timeCollection);

            const addInterval = intervals.docs.map(doc => doc.id);
            if(addInterval.length > 4) {
                console.log(`Cannot add ${email} to ${formattedDate} at ${time}. Slot is full.`);
                return "full";
            }
            if(addInterval.includes(email)) {
                console.log(`User ${email} is already reserved for ${formattedDate} at this interval.`);
                return null;
            }

            let lastFoundInterval = undefined;
            for(const interval of timeIntervals) {
                const intervalCollectionRef = collection(docRef, interval);
                const snapshot = await getDocs(intervalCollectionRef);
                const existingReservations = snapshot.docs.map(doc => doc.id);

                if(existingReservations.includes(email) && interval != time) {
                    lastFoundInterval = interval;
                    break;
                }
            }
            
            if(lastFoundInterval) {
                const lastIntervalCollectionRef = collection(docRef, lastFoundInterval);
                const lastIntervalSnapshot = await getDocs(lastIntervalCollectionRef);
                for (const docSnap of lastIntervalSnapshot.docs) {
                    if (docSnap.id === email) {
                        await deleteDoc(docSnap.ref);
                        console.log(`Deleted ${email} from the ${lastFoundInterval} interval.`);
                        break;
                    }
                }
            }
            await setDoc(doc(timeCollection, email), { email });
            console.log(`Added ${email} to the ${time} interval on ${formattedDate}.`);
            const user = UserService.updateReservation(formattedDate, time, email);
            return user;
    
        } catch (error) {
            console.error('Error adding reservation:', error);
            throw new Error('Failed to add reservation');
        }
    }
    

    static async cancelReservation(date, time, email) {
        try {
            const formattedDate = date;
            const docRef = doc(dbReservations, formattedDate);
            const timeCollection = collection(docRef, time);
            const snapshot = await getDocs(timeCollection);
    
            let reservationFound = false;
            for (const docSnap of snapshot.docs) {
                if (docSnap.id === email) {
                    await deleteDoc(docSnap.ref);
                    console.log(`Reservation for ${email} on ${formattedDate} at ${time} has been canceled.`);
                    reservationFound = true;
                    break;
                }
            }
    
            if (!reservationFound) {
                console.log(`No reservation found for ${email} on ${formattedDate} at ${time}.`);
                return null;
            }

            const user = UserService.cancelReservation(formattedDate, time, email)
            return user;
        } catch (error) {
            console.error('Error canceling reservation:', error);
            throw new Error('Failed to cancel reservation');
        }
    }
}
module.exports = ReservationService;