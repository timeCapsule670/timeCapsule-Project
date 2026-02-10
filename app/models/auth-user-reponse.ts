export class AuthUserResponse {
    accessToken: string;
    idToken?: string;
    expiresIn: number;

    constructor(accessToken: string, expiresIn: number, idToken?: string) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.idToken = idToken;
    }
}
