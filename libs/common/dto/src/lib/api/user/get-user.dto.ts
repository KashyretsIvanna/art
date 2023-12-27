export class GetUserRes {
  email: string;
  name: string;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  steps: StepsToCompleteProfile;
}

export class StepsToCompleteProfile {
  isLookingForCompleted: boolean;
  isPhotosLoaded: boolean;
  isProfileCompleted: boolean;
}
