import mongoose from "mongoose";

export const connect_DB = async (URL: string) => {
    try {
        await mongoose.connect(URL);
        console.log("Connected to DB Successfully");

    } catch (error) {
        console.error("Error occurred: ", error);

    }
}