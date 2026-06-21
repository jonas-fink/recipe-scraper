import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'recipe-scraper',
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('DB connection failed:', error);
        process.exit(1);
    }
};

export default connectDB;
