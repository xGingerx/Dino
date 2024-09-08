const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, deleteField, dbReservations, dbUsers } = require('../firebase/firebase');
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
                
                allReservations[date] = {};  
    
                for (const interval of timeIntervals) {
                    const timeSlotCollectionRef = collection(docSnap.ref, interval); 
                    const timeSlotDocs = await getDocs(timeSlotCollectionRef);  
                    
                    timeSlotDocs.forEach(doc => {
                        allReservations[date][interval] = doc.id || "";  
                    });
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
            date = new Date(date)
            const formattedDate = ReservationService.formatDate(date);
            const docRef = doc(dbReservations, formattedDate);
            
            const intervalCollectionRef = collection(docRef, time);
            const snapshot = await getDocs(intervalCollectionRef);
            if (snapshot.empty) {
                console.log(`No reservations found for ${formattedDate} at ${time}.`);
                return null;
            }
            const reservationDoc = snapshot.docs[0];
            const reservation = reservationDoc.id;
            if(reservation == "temp"){
                
            }
            console.log(reservations)
            //await setDoc(doc(intervalCollectionRef, email), { email });
            
            console.log(`Reservation added for ${email} on ${formattedDate} at ${time}.`);
        } catch (error) {
            console.error('Error adding reservation:', error);
            throw new Error('Failed to add reservation');
        }

    }

    static async cancelReservation(date, time, email) {
        
    }
}
module.exports = ReservationService;
