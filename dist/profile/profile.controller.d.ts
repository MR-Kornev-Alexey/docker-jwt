import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    createProfile(dto: any): Promise<{
        statusCode: number;
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            organization_id: string;
            registration_status: import(".prisma/client").$Enums.RegistrationStatus;
            created_at: Date;
        };
    } | {
        statusCode: number;
        user: string;
    }>;
    getProfileById(id: number): Promise<void>;
}
