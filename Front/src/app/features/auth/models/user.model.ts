export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export type SignUpErrorReason = 'email-taken' | 'invalid-data' | 'network' | 'server';

export type SignInErrorReason = 'invalid-credentials' | 'network' | 'server';

export class SignUpError extends Error {
  constructor(readonly reason: SignUpErrorReason) {
    super(reason);
    this.name = 'SignUpError';
  }
}

export class SignInError extends Error {
  constructor(readonly reason: SignInErrorReason) {
    super(reason);
    this.name = 'SignInError';
  }
}

export type SignInRequest = Pick<SignUpRequest, 'email' | 'password'>;

export function userFullName({ firstName, lastName }: User): string {
  return `${firstName} ${lastName}`;
}
