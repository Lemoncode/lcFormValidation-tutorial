export class SignupEntity {
  username: string;
  password: string;
  confirmPassword: string;

  constructor() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
