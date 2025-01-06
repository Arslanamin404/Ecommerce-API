export interface ITokenPayload {
    id: string;
    email: string;
    role: "user" | "admin";
}