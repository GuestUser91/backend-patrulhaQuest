import bcrypt from 'bcrypt';
export class PasswordService {
    static async hash(password) {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    static async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
PasswordService.SALT_ROUNDS = 10;
//# sourceMappingURL=password.js.map