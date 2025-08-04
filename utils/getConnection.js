import mongoose from 'mongoose';

const getConnection = () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => {
        console.log('✅ DB is connected');
      })
      .catch((error) => {
        console.log('❌ Failed to connect to DB', error.message);
      });
  } catch (error) {
    console.log(error.message);
  }
};

export default getConnection;