import { IUser } from "../interfaces/IUser";
import { User } from "../models/userModel";


export class UserService {
    static async checkExistingUser(email: string): Promise<Boolean> {
        const user = await User.findOne({ email });
        return !!user; //returns true if user exists
    }

    static async findUserById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    static async findUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    static async findUserByRefreshToken(refreshToken: string): Promise<IUser | null> {
        return await User.findOne({ refreshToken });
    }
    static async createUser(userData: Partial<IUser>): Promise<IUser> {
        const new_user = new User(userData);
        return await new_user.save();
    }
    static async deleteUser(id: string) {
        return await User.deleteOne({ _id: id });
    }
}
